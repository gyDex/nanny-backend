import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import * as crypto from 'crypto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProdumusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly usersServices: UsersService,
  ) {}

  generateSignature(params: Record<string, any>): string {
    const secretKey = this.configService.get<string>('PRODUMUS_SECRET_KEY');
    if (!secretKey) {
      throw new Error('secretKey отсутствует');
    }

    // исключаем пустые значения
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    // сортируем ключи по алфавиту
    const sortedKeys = Object.keys(filteredParams).sort();

    // собираем строку так же, как http_build_query в PHP (k1=v1&k2=v2...)
    const stringToSign = sortedKeys
      .map(k => `${k}=${filteredParams[k]}`)
      .join('&');

    return crypto
      .createHmac('sha256', secretKey)
      .update(stringToSign)
      .digest('hex');
  }

  createSignature(data: any, secretKey: string, algo = 'sha256'): string {
    if (!crypto.getHashes().includes(algo)) {
      throw new Error(`Unsupported algorithm: ${algo}`);
    }

    const normalizedData = this.sortAndStringify(data);

    return crypto
      .createHmac(algo, secretKey)
      .update(JSON.stringify(normalizedData).replaceAll('/', '\\/'))
      .digest('hex');
  }

  verifySignature(data: any, secretKey: string, sign: string, algo = 'sha256'): boolean {
    const expected = this.createSignature(data, secretKey, algo);
    return expected.toLowerCase() === sign.toLowerCase();
  }

  sortAndStringify(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortAndStringify(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this.sortAndStringify(obj[key]);
          return acc;
        }, {} as Record<string, any>);
    }

    return obj !== null && obj !== undefined ? obj.toString() : '';
  }

  async handleCallback(body: any, headers: Record<string, string>) {
    console.log(headers)
    console.log(body)

    const signature = headers['sign']
    if (!signature) {
      throw new BadRequestException('Signature header missing');
    }

    const secretKey = this.configService.get<string>('PRODUMUS_SECRET_KEY');
    if (!secretKey) {
      throw new Error('secretKey отсутствует');
    }

    // Проверяем подпись
    if (!this.verifySignature(body, secretKey, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    // Если статус "успешная оплата"
    if (['paid', 'success'].includes(body.payment_status)) {
      await this.prisma.order.update({
        where: { id: body.order_num },
        data: { status: 'PAID' },
      });

      const parent = await this.prisma.parentProfile.findFirst({
        where: {
          user: {
            email: body.customer_email,
          }
        }
      });

      console.log(parent)

      if (!parent) {
        throw new BadRequestException('Parent not found');
      }

      await this.usersServices.subscribeParent(parent.userId);

      await this.prisma.user.update({
        where: { email: body.customer_email },
        data: { 
          parentProfile:{
          update: {
            subscribe: {
              connect: {
                parentId: parent.id,
              }
            }
          }
        } },
      });

      return { status: 'success' };
    }

    return { status: 'ignored' };
  }
}

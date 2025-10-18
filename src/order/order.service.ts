// orders.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, body: any) {
    return this.prisma.order.create({
      data: {
        id:body.orderId,
        userId,
        amount:body.amount,
      },
    });
  }

  async markPaid(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });
  }

  async get(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
    });
  }
}

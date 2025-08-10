import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from './supabase.service';
import { encryptBuffer } from 'utils/encrypt';
import { JwtAuthGuard } from 'src/auth/strategies/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly supabaseService: SupabaseService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuthGuard)
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
        throw new BadRequestException('File is required');
        }

        // Шифруем
        const { encrypted, iv } = encryptBuffer(file.buffer);

        // В начало файла добавляем IV (16 байт)
        const encryptedWithIv = Buffer.concat([iv, encrypted]);

        // Формируем путь в хранилище
        const path = `encrypted/${Date.now()}_${file.originalname}.enc`;

        await this.supabaseService.uploadFile(path, encryptedWithIv, 'application/octet-stream');

        return {
            message: 'File uploaded and encrypted',
            path,
        };
    }
}

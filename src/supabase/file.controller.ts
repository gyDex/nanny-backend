import { Controller, Get, Query, Res, BadRequestException, UseGuards, Post, Body } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { Response } from 'express';
import { decryptBuffer } from 'utils/encrypt';
import { JwtAuthGuard } from 'src/auth/strategies/guards/jwt-auth.guard';
import archiver = require('archiver');

@Controller('file')
export class FileController {
  constructor(private readonly supabaseService: SupabaseService) {}

    @Get('download')
    @UseGuards(JwtAuthGuard)
    async downloadFile(@Query('path') path: string, @Res() res: Response) {
        if (!path) {
        throw new BadRequestException('Path query parameter is required');
        }

        const fileBuffer = await this.supabaseService.downloadFile(path);

        const iv = fileBuffer.slice(0, 16);
        const encrypted = fileBuffer.slice(16);

        const decrypted = decryptBuffer(encrypted, iv);

        if (path.endsWith('.pdf.enc')) res.setHeader('Content-Type', 'application/pdf');
        else if (path.endsWith('.jpg.enc') || path.endsWith('.jpeg.enc')) res.setHeader('Content-Type', 'image/jpeg');
        else if (path.endsWith('.png.enc')) res.setHeader('Content-Type', 'image/png');
        else res.setHeader('Content-Type', 'application/octet-stream');

        res.send(decrypted);
    }

  @Post('download-zip')
  @UseGuards(JwtAuthGuard)
  async downloadZip(@Body() body: { paths: string[] }, @Res() res: Response) {
    if (!body.paths || !Array.isArray(body.paths) || body.paths.length === 0) {
      throw new BadRequestException('Paths array is required');
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="files.zip"');
    archive.pipe(res);

    archive.on('error', (err) => {
      throw err;
    });

    const filePromises = body.paths.map(async (path) => {
      try {
        const fileBuffer = await this.supabaseService.downloadFile(path);
        
        const iv = fileBuffer.slice(0, 16);
        const encrypted = fileBuffer.slice(16);
        const decrypted = decryptBuffer(encrypted, iv);

        const fileName = this.getOriginalFileName(path);
        
        return { name: fileName, data: decrypted, success: true };
      } catch (error) {
        console.error(`Error processing file ${path}:`, error);
        return { 
          name: `error-${path.replace(/\.enc$/, '.txt')}`, 
          data: `Error loading file: ${path}\nError: ${error.message}`,
          success: false 
        };
      }
    });

    const files = await Promise.all(filePromises);
    
    files.forEach(file => {
      archive.append(file.data, { name: file.name });
    });

    await archive.finalize();
  }

  private getOriginalFileName(encryptedPath: string): string {
    return encryptedPath.replace(/\.enc$/, '');
  }
}

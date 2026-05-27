import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UploadsController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file?: { originalname: string; buffer: Buffer }) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const ext = extname(file.originalname || '').toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowed.includes(ext)) {
      throw new BadRequestException('Only jpg/jpeg/png/webp files are allowed');
    }

    const uploadDir = join(process.cwd(), 'backend', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const targetPath = join(uploadDir, filename);
    await writeFile(targetPath, file.buffer);

    return {
      url: `/uploads/${filename}`
    };
  }
}

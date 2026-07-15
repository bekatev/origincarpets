import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { resolveUploadsDir } from '../../uploads-path';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_BYTES = 15 * 1024 * 1024;

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES }
    })
  )
  async uploadImage(
    @UploadedFile()
    file?: { originalname: string; mimetype?: string; buffer?: Buffer; size?: number }
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    const ext = extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const mimeOk = mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp';
    if (!ALLOWED_EXT.has(ext) && !mimeOk) {
      throw new BadRequestException('Only jpg/jpeg/png/webp files are allowed (not HEIC)');
    }

    const resolvedExt = ALLOWED_EXT.has(ext)
      ? ext
      : mime === 'image/png'
        ? '.png'
        : mime === 'image/webp'
          ? '.webp'
          : '.jpg';

    const uploadDir = resolveUploadsDir();
    const filename = `${Date.now()}-${randomUUID()}${resolvedExt}`;
    await writeFile(join(uploadDir, filename), file.buffer);

    return {
      url: `/uploads/${filename}`
    };
  }
}

import { BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { resolveUploadsDir } from '../../uploads-path';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_BYTES = 12 * 1024 * 1024;

class UploadImageJsonDto {
  @IsString()
  @MinLength(1)
  filename!: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  /** Raw base64 or a data URL (`data:image/jpeg;base64,...`). */
  @IsString()
  @MinLength(32)
  data!: string;
}

function extensionFromNameOrType(filename: string, contentType?: string) {
  const ext = extname(filename || '').toLowerCase();
  if (ALLOWED_EXT.has(ext)) return ext;

  const mime = (contentType || '').toLowerCase();
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  return null;
}

function decodeBase64Payload(data: string) {
  const trimmed = data.trim();
  const comma = trimmed.indexOf(',');
  const raw = trimmed.startsWith('data:') && comma >= 0 ? trimmed.slice(comma + 1) : trimmed;
  return Buffer.from(raw.replace(/\s/g, ''), 'base64');
}

async function persistImage(buffer: Buffer, filename: string, contentType?: string) {
  if (!buffer.length) {
    throw new BadRequestException('File is empty');
  }
  if (buffer.length > MAX_BYTES) {
    throw new BadRequestException('Image is too large (max 12MB)');
  }

  const resolvedExt = extensionFromNameOrType(filename, contentType);
  if (!resolvedExt) {
    throw new BadRequestException('Only jpg/jpeg/png/webp files are allowed (not HEIC)');
  }

  const uploadDir = resolveUploadsDir();
  const storedName = `${Date.now()}-${randomUUID()}${resolvedExt}`;
  await writeFile(join(uploadDir, storedName), buffer);

  return { url: `/uploads/${storedName}` };
}

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UploadsController {
  /** Preferred: JSON + base64 — survives proxies better than multipart. */
  @Post('image-json')
  async uploadImageJson(@Body() body: UploadImageJsonDto) {
    const buffer = decodeBase64Payload(body.data);
    return persistImage(buffer, body.filename, body.contentType);
  }

  /** Legacy multipart support. */
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES }
    })
  )
  async uploadImage(
    @UploadedFile()
    file?: { originalname: string; mimetype?: string; buffer?: Buffer }
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    return persistImage(file.buffer, file.originalname || 'upload.jpg', file.mimetype);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { extname, join, resolve as resolvePath } from 'path';
import type { Response } from 'express';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { resolveMediaSearchDirs, resolveUploadTarget } from '../../uploads-path';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_BYTES = 12 * 1024 * 1024;
const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

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

/** Encode so URL does not end in .png/.jpg (nginx steals those from /api/). */
export function encodeMediaFileName(storedName: string) {
  return storedName.replace(/\./g, '~');
}

export function decodeMediaFileName(encoded: string) {
  return encoded.replace(/~/g, '.');
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

  const target = resolveUploadTarget();
  const storedName = `${Date.now()}-${randomUUID()}${resolvedExt}`;
  await writeFile(join(target.dir, storedName), buffer);

  // Always use Nest media URLs that avoid image-extension nginx hijacking.
  // Legacy mode still writes into the nginx folder when configured, but public URL stays under /api/media/file/...
  return {
    url: `/api/media/file/${encodeMediaFileName(storedName)}`,
    storedName,
    mode: target.mode
  };
}

function sendMediaFile(filename: string, res: Response) {
  if (!SAFE_NAME.test(filename) || filename.includes('..')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  for (const dir of resolveMediaSearchDirs()) {
    const fullPath = resolvePath(join(dir, filename));
    if (existsSync(fullPath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(fullPath);
    }
  }

  return res.status(404).json({ message: 'Image not found' });
}

/**
 * Public image files — no auth.
 * IMPORTANT: do not use URLs that end in .png/.jpg/.webp/.gif — production nginx
 * routes those to Next.js instead of the API.
 */
@Controller('media')
export class MediaController {
  @Get('file/:encodedName')
  serveEncoded(@Param('encodedName') encodedName: string, @Res() res: Response) {
    return sendMediaFile(decodeMediaFileName(encodedName), res);
  }

  @Get('download')
  serveQuery(@Query('f') fileName: string | undefined, @Res() res: Response) {
    if (!fileName?.trim()) {
      return res.status(400).json({ message: 'Missing file' });
    }
    return sendMediaFile(fileName.trim(), res);
  }
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

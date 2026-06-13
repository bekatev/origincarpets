import { Injectable } from '@nestjs/common';
import type { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } }
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(input: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role ?? 'CUSTOMER'
      }
    });
  }

  updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    await this.prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });
    return this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt }
    });
  }

  findValidPasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });
  }

  markPasswordResetTokenUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() }
    });
  }
}

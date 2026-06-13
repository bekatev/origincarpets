import { Injectable } from '@nestjs/common';
import type { PaymentMethod, User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddressesService } from './addresses.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly addressesService: AddressesService
  ) {}

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
    phone?: string;
    preferredPaymentMethod?: PaymentMethod;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        preferredPaymentMethod: input.preferredPaymentMethod,
        role: input.role ?? 'CUSTOMER'
      }
    });
  }

  async getAccountProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const defaultAddress = await this.addressesService.getDefaultSavedAddress(userId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      preferredPaymentMethod: user.preferredPaymentMethod,
      defaultShippingAddress: this.addressesService.serializeAddress(defaultAddress)
    };
  }

  async updateAccountProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredPaymentMethod: dto.preferredPaymentMethod
      }
    });

    return this.getAccountProfile(userId);
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

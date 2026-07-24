import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export type GuestCheckoutTokenPayload = {
  orderId: string;
  purpose: 'guest_checkout';
};

@Injectable()
export class GuestCheckoutTokenService {
  private readonly payTtlSeconds = 60 * 60 * 2; // 2 hours

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  signForPayment(orderId: string): string {
    return this.jwt.sign(
      { orderId, purpose: 'guest_checkout' } satisfies GuestCheckoutTokenPayload,
      {
        secret: this.jwtSecret(),
        expiresIn: this.payTtlSeconds
      }
    );
  }

  verifyForPayment(token: string, orderId: string): void {
    let payload: GuestCheckoutTokenPayload;
    try {
      payload = this.jwt.verify<GuestCheckoutTokenPayload>(token, {
        secret: this.jwtSecret()
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired guest checkout token');
    }

    if (payload.purpose !== 'guest_checkout' || payload.orderId !== orderId) {
      throw new UnauthorizedException('Guest checkout token does not match this order');
    }
  }

  private jwtSecret() {
    return this.config.get<string>('JWT_SECRET') || 'dev-secret';
  }
}

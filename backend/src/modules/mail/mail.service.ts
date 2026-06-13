import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT', '587'));
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    this.from = config.get<string>('SMTP_FROM', 'Origin Carpets <noreply@origincarpets.com>');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    } else {
      this.transporter = null;
      this.logger.warn('SMTP not configured — password reset emails will be logged only');
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Reset your Origin Carpets password';
    const text = [
      'You requested a password reset for your Origin Carpets account.',
      '',
      'Open this link to choose a new password (valid for 1 hour):',
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.'
    ].join('\n');

    const html = `
      <p>You requested a password reset for your Origin Carpets account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link is valid for 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    if (!this.transporter) {
      this.logger.log(`Password reset link for ${to}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({ from: this.from, to, subject, text, html });
  }
}

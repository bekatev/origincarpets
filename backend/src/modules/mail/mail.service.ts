import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly resendApiKey: string | null;
  private readonly relayUrl: string | null;
  private readonly relaySecret: string | null;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'Origin Carpets <noreply.origincarpets@gmail.com>');
    this.resendApiKey = config.get<string>('RESEND_API_KEY') ?? null;
    this.relayUrl = config.get<string>('MAIL_RELAY_URL') ?? null;
    this.relaySecret = config.get<string>('MAIL_RELAY_SECRET') ?? null;

    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT', '587'));
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000
      });
    } else {
      this.transporter = null;
    }

    if (!this.resendApiKey && !this.relayUrl && !this.transporter) {
      this.logger.warn('Mail not configured — password reset emails will be logged only');
    } else if (this.resendApiKey) {
      this.logger.log('Mail transport: Resend API');
    } else if (this.relayUrl) {
      this.logger.log('Mail transport: HTTPS relay');
    } else {
      this.logger.log('Mail transport: SMTP');
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

    await this.sendMail({ to, subject, text, html });
    this.logger.log(`Password reset email sent to ${to}`);
  }

  private async sendMail(payload: MailPayload): Promise<void> {
    if (this.resendApiKey) {
      await this.sendViaResend(payload);
      return;
    }

    if (this.relayUrl && this.relaySecret) {
      await this.sendViaRelay(payload);
      return;
    }

    if (this.transporter) {
      await this.transporter.sendMail({ from: this.from, ...payload });
      return;
    }

    this.logger.log(`Password reset link for ${payload.to}: ${payload.text.split('\n')[3] ?? payload.text}`);
  }

  private async sendViaResend(payload: MailPayload): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend failed (${response.status}): ${body}`);
    }
  }

  private async sendViaRelay(payload: MailPayload): Promise<void> {
    const response = await fetch(this.relayUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: this.relaySecret,
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Mail relay failed (${response.status}): ${body}`);
    }

    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!result.ok) {
      throw new Error(result.error ?? 'Mail relay rejected the request');
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

import { AppConfigService } from '../../config/config.service';
import type { EmailAdapter } from './email.adapter';

@Injectable()
export class NodemailerAdapter implements EmailAdapter {
  private transporter: Transporter;

  constructor(private configService: AppConfigService) {
    try {
      const emailConfig = this.configService.emailConfig;

      if (!emailConfig.user || !emailConfig.pass) {
        console.error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: emailConfig.service,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', (error as Error).message);
    }
  }

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    if (!this.transporter) {
      throw new BadRequestException('Email service not configured - skipping email send');
    }

    try {
      const emailConfig = this.configService.emailConfig;
      await this.transporter.sendMail({
        from: emailConfig.from || 'noreply@app.com',
        to,
        subject,
        html: message,
      });
    } catch (error) {
      console.error('Failed to send email:', (error as Error).message);
    }
  }
}

import { Injectable } from '@nestjs/common';

import { EmailAdapter } from './adapters/email.adapter';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailAdapter: EmailAdapter,
    private readonly templateService: TemplateService,
  ) {}

  async sendOtpEmail(email: string, otp: string, userName?: string) {
    const htmlContent = this.templateService.renderOtpTemplate(otp, userName);

    await this.emailAdapter.sendEmail(email, 'Verify Your Email - OTP Code', htmlContent);
  }

  async sendWelcomeEmail(email: string, userName: string) {
    const htmlContent = this.templateService.renderWelcomeTemplate(userName);

    await this.emailAdapter.sendEmail(email, 'Welcome to Ecommerce App!', htmlContent);
  }

  async sendTwoFactorOtp(email: string, otp: string) {
    const htmlContent = this.templateService.renderTwoFactorOtpTemplate(otp);

    await this.emailAdapter.sendEmail(email, 'Two-Factor Authentication Code', htmlContent);
  }
}

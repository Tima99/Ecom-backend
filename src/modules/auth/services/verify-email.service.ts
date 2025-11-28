import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/core/email/email.service';
import { OtpUtil } from 'src/core/utils/otp.util';

import { EmailVerification } from '../schemas/email-verification.schema';

@Injectable()
export class VerifyEmailService {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerification>,
    private readonly emailService: EmailService,
  ) {}

  async generateOtp(email: string) {
    const otp: ReturnType<typeof OtpUtil.generate> = OtpUtil.generate();

    await this.emailVerificationModel.findOneAndUpdate(
      { email },
      { email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true },
    );

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'OTP sent' };
  }

  async verifyOtp(email: string, otp: string) {
    const record = await this.emailVerificationModel.findOne({ email });

    if (!record) throw new BadRequestException('OTP not generated');
    if (record.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (record.expiresAt < new Date()) throw new BadRequestException('OTP expired');

    record.verified = true;
    await record.save();

    return { message: 'Email verified' };
  }
}

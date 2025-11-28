import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailVerification } from '../schemas/email-verification.schema';

@Injectable()
export class EmailVerificationRepository {
  constructor(@InjectModel(EmailVerification.name) private model: Model<EmailVerification>) {}

  async create(data: Partial<EmailVerification>): Promise<EmailVerification> {
    return this.model.create(data);
  }

  async findByEmailAndOtp(email: string, otp: string): Promise<EmailVerification | null> {
    return this.model.findOne({ email, otp, isUsed: false });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { isUsed: true });
  }
}

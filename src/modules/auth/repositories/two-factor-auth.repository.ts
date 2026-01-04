import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { TwoFactorAuth, TwoFactorAuthDocument } from '../schemas/two-factor-auth.schema';

@Injectable()
export class TwoFactorAuthRepository {
  constructor(
    @InjectModel(TwoFactorAuth.name)
    private twoFactorAuthModel: Model<TwoFactorAuthDocument>,
  ) {}

  async create(data: Partial<TwoFactorAuth>): Promise<TwoFactorAuthDocument> {
    return this.twoFactorAuthModel.create(data);
  }

  async findByUserIdAndSessionId(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<TwoFactorAuthDocument | null> {
    return this.twoFactorAuthModel.findOne({
      userId,
      sessionId,
      verified: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async verifyOtp(
    userId: Types.ObjectId,
    sessionId: string,
    otp: string,
  ): Promise<TwoFactorAuthDocument | null> {
    return this.twoFactorAuthModel.findOneAndUpdate(
      {
        userId,
        sessionId,
        otp,
        verified: false,
        expiresAt: { $gt: new Date() },
      },
      { verified: true },
      { new: true },
    );
  }

  async deleteExpiredOtps(): Promise<void> {
    await this.twoFactorAuthModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(userData);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async updateEmailVerification(email: string, isVerified: boolean): Promise<void> {
    await this.userModel.updateOne({ email }, { isEmailVerified: isVerified });
  }

  async updateLastLogin(userId: Types.ObjectId): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { lastLoginAt: new Date(), loginAttempts: 0, lockedUntil: null },
    );
  }

  async updateTwoFactorStatus(userId: Types.ObjectId, enabled: boolean): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { twoFactorEnabled: enabled });
  }

  async incrementLoginAttempts(userId: Types.ObjectId): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $inc: { loginAttempts: 1 } });
  }

  async lockAccount(userId: Types.ObjectId, lockUntil: Date): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { lockedUntil: lockUntil });
  }
}

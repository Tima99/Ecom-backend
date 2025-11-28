import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.userModel.create(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async updateEmailVerification(email: string, isVerified: boolean): Promise<void> {
    await this.userModel.updateOne({ email }, { isEmailVerified: isVerified });
  }
}

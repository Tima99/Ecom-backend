import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { EmailVerification } from '../schemas/email-verification.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class SignupService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerification>,
  ) {}

  async signup(email: string, password: string, name: string) {
    const verification = await this.emailVerificationModel.findOne({ email });

    if (!verification?.verified) throw new BadRequestException('Email not verified');

    const exists = await this.userModel.findOne({ email });
    if (exists) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      password: hashed,
      name,
    });

    return { message: 'User created', user };
  }
}

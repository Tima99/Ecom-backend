import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/core/email/email.module';

import { AuthSignupController } from './controllers/auth.signup.controller';
import { AuthVerifyController } from './controllers/auth.verify.controller';
import { EmailVerification, EmailVerificationSchema } from './schemas/email-verification.schema';
import { User, UserSchema } from './schemas/user.schema';
import { SignupService } from './services/signup.service';
import { VerifyEmailService } from './services/verify-email.service';

@Module({
  imports: [
    EmailModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),
  ],
  controllers: [AuthSignupController, AuthVerifyController],
  providers: [SignupService, VerifyEmailService],
})
export class AuthModule {}

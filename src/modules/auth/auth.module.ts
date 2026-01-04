import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from '../../core/email/email.module';
import { AuthLoginController } from './controllers/auth.login.controller';
import { AuthSignupController } from './controllers/auth.signup.controller';
import { AuthVerifyController } from './controllers/auth.verify.controller';
import { EmailVerificationRepository } from './repositories/email-verification.repository';
import { TwoFactorAuthRepository } from './repositories/two-factor-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { EmailVerification, EmailVerificationSchema } from './schemas/email-verification.schema';
import { TwoFactorAuth, TwoFactorAuthSchema } from './schemas/two-factor-auth.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import { AuthService } from './services/auth.service';
import { SignupService } from './services/signup.service';
import { VerifyEmailService } from './services/verify-email.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    EmailModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: TwoFactorAuth.name, schema: TwoFactorAuthSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthSignupController, AuthVerifyController, AuthLoginController],
  providers: [
    SignupService,
    VerifyEmailService,
    AuthService,
    UserRepository,
    EmailVerificationRepository,
    UserSessionRepository,
    TwoFactorAuthRepository,
    JwtStrategy,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}

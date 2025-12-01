import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as otpGenerator from 'otp-generator';
import { Types } from 'mongoose';
import { UserRepository } from '../repositories/user.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { TwoFactorAuthRepository } from '../repositories/two-factor-auth.repository';
import { LoginDto, VerifyTwoFactorDto, ToggleTwoFactorDto } from '../dto/login.dto';
import { EmailService } from '../../../core/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private userSessionRepository: UserSessionRepository,
    private twoFactorAuthRepository: TwoFactorAuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto, deviceInfo: any) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.userSessionRepository.create({
      userId: user._id,
      sessionId,
      deviceInfo: deviceInfo.deviceInfo,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      expiresAt,
      lastAccessedAt: new Date(),
    });

    await this.userRepository.updateLastLogin(user._id);

    if (user.twoFactorEnabled) {
      const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
      
      await this.twoFactorAuthRepository.create({
        userId: user._id,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        sessionId,
      });

      await this.emailService.sendTwoFactorOtp(user.email, otp);

      return {
        requiresTwoFactor: true,
        sessionId,
        message: '2FA code sent to your email',
      };
    }

    const token = this.generateJwtToken(user._id, sessionId);
    return {
      requiresTwoFactor: false,
      token,
      user: { id: user._id, email: user.email, name: user.name },
    };
  }

  async verifyTwoFactor(verifyDto: VerifyTwoFactorDto) {
    const session = await this.userSessionRepository.findBySessionId(verifyDto.sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    const twoFactorAuth = await this.twoFactorAuthRepository.verifyOtp(
      session.userId,
      verifyDto.sessionId,
      verifyDto.otp,
    );

    if (!twoFactorAuth) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const token = this.generateJwtToken(session.userId, verifyDto.sessionId);
    const user = await this.userRepository.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      token,
      user: { id: user._id, email: user.email, name: user.name },
    };
  }

  async toggleTwoFactor(userId: Types.ObjectId, toggleDto: ToggleTwoFactorDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify OTP before enabling/disabling 2FA
    const sessionId = this.generateSessionId();
    const storedOtp = await this.twoFactorAuthRepository.create({
      userId,
      otp: toggleDto.otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      sessionId,
    });

    await this.emailService.sendTwoFactorOtp(user.email, toggleDto.otp);

    const newStatus = !user.twoFactorEnabled;
    await this.userRepository.updateTwoFactorStatus(userId, newStatus);

    return {
      twoFactorEnabled: newStatus,
      message: `2FA ${newStatus ? 'enabled' : 'disabled'} successfully`,
    };
  }

  async logout(sessionId: string) {
    await this.userSessionRepository.deactivateSession(sessionId);
    return { message: 'Logged out successfully' };
  }

  async logoutAllDevices(userId: Types.ObjectId) {
    await this.userSessionRepository.deactivateAllUserSessions(userId);
    return { message: 'Logged out from all devices' };
  }

  async getActiveSessions(userId: Types.ObjectId) {
    return this.userSessionRepository.findActiveSessionsByUserId(userId);
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateJwtToken(userId: Types.ObjectId, sessionId: string): string {
    return this.jwtService.sign(
      { sub: userId, sessionId },
      { expiresIn: '7d' },
    );
  }
}
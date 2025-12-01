import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { UserRepository } from '../repositories/user.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
    private userSessionRepository: UserSessionRepository,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const userId = new Types.ObjectId(payload.sub);
    const sessionId = payload.sessionId;

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify session is active
    const session = await this.userSessionRepository.findBySessionId(sessionId);
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Update last accessed time
    await this.userSessionRepository.updateLastAccessed(sessionId);

    return {
      userId: user._id,
      email: user.email,
      sessionId,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }
}
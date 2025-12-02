import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { UserRepository } from '../repositories/user.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { JwtPayload, AuthenticatedUser } from '../../../types/jwt.types';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
    private userSessionRepository: UserSessionRepository,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = new Types.ObjectId(payload.userId);
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

      req.user = {
        userId: user._id,
        email: user.email,
        sessionId,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
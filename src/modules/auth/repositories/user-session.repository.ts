import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSession, UserSessionDocument } from '../schemas/user-session.schema';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectModel(UserSession.name)
    private userSessionModel: Model<UserSessionDocument>,
  ) {}

  async create(sessionData: Partial<UserSession>): Promise<UserSessionDocument> {
    return this.userSessionModel.create(sessionData);
  }

  async findBySessionId(sessionId: string): Promise<UserSessionDocument | null> {
    return this.userSessionModel.findOne({ sessionId, isActive: true });
  }

  async findActiveSessionsByUserId(userId: Types.ObjectId): Promise<UserSessionDocument[]> {
    return this.userSessionModel.find({ userId, isActive: true });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.userSessionModel.updateOne(
      { sessionId },
      { isActive: false }
    );
  }

  async deactivateAllUserSessions(userId: Types.ObjectId): Promise<void> {
    await this.userSessionModel.updateMany(
      { userId },
      { isActive: false }
    );
  }

  async updateLastAccessed(sessionId: string): Promise<void> {
    await this.userSessionModel.updateOne(
      { sessionId },
      { lastAccessedAt: new Date() }
    );
  }

  async findExistingDeviceSession(
    userId: Types.ObjectId,
    deviceInfo: string,
    userAgent: string,
  ): Promise<UserSessionDocument | null> {
    return this.userSessionModel.findOne({
      userId,
      deviceInfo,
      userAgent,
      isActive: true,
    });
  }

  async updateExistingSession(
    sessionId: string,
    newSessionId: string,
    ipAddress: string,
  ): Promise<void> {
    await this.userSessionModel.updateOne(
      { sessionId },
      {
        sessionId: newSessionId,
        ipAddress,
        lastAccessedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    );
  }
}
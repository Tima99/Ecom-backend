import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
  sessionId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: Types.ObjectId;
  email: string;
  sessionId: string;
  twoFactorEnabled: boolean;
}

export enum NotificationProvider {
  FIREBASE = 'firebase',
  AWS_SNS = 'aws_sns',
  ONESIGNAL = 'onesignal',
  WEB_PUSH = 'web_push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

export enum NotificationType {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

export enum DeviceType {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}

export interface NotificationPayload {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  badge?: string;
  sound?: string;
  clickAction?: string;
  data?: Record<string, string>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  failedTokens?: string[];
}

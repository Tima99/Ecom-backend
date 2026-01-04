import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { NotificationPayload, NotificationResult } from '../../types/notification.types';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private configService: AppConfigService) {}

  onModuleInit() {
    const { projectId, clientEmail, privateKey } = this.configService.firebaseConfig;

    if (!this.app && projectId && clientEmail && privateKey) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    }
  }

  async sendToDevice(token: string, payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: payload.data || {},
        webpush: payload.clickAction
          ? {
              fcmOptions: {
                link: payload.clickAction,
              },
            }
          : undefined,
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendToMultipleDevices(
    tokens: string[],
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: payload.data || {},
        webpush: payload.clickAction
          ? {
              fcmOptions: {
                link: payload.clickAction,
              },
            }
          : undefined,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      const failedTokens: string[] = [];
      response.responses.forEach((resp: admin.messaging.SendResponse, idx: number) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      return {
        success: response.successCount > 0,
        messageId: `${response.successCount}/${tokens.length} sent`,
        failedTokens,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        failedTokens: tokens,
      };
    }
  }

  async sendToTopic(topic: string, payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: payload.data || {},
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

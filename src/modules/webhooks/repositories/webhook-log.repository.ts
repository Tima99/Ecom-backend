import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-log.schema';

@Injectable()
export class WebhookLogRepository {
  constructor(
    @InjectModel(WebhookLog.name)
    private webhookLogModel: Model<WebhookLogDocument>,
  ) {}

  async create(webhookData: Partial<WebhookLog>): Promise<WebhookLogDocument> {
    return this.webhookLogModel.create(webhookData);
  }

  async findByEventId(eventId: string): Promise<WebhookLogDocument | null> {
    return this.webhookLogModel.findOne({ eventId });
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<WebhookLogDocument[]> {
    return this.webhookLogModel.find({ paymentIntentId }).sort({ createdAt: -1 });
  }

  async markProcessed(eventId: string): Promise<WebhookLogDocument | null> {
    return this.webhookLogModel.findOneAndUpdate({ eventId }, { processed: true }, { new: true });
  }

  async logError(eventId: string, error: string): Promise<WebhookLogDocument | null> {
    return this.webhookLogModel.findOneAndUpdate(
      { eventId },
      { error, processed: false },
      { new: true },
    );
  }

  async findUnprocessed(): Promise<WebhookLogDocument[]> {
    return this.webhookLogModel.find({ processed: false }).sort({ createdAt: 1 });
  }
}

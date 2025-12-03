import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeWebhookController } from './stripe-webhook.controller';
import { OrdersModule } from '../user/orders/orders.module';
import { WebhookLog, WebhookLogSchema } from './schemas/webhook-log.schema';
import { AppConfigModule } from '../../core/config/config.module';
import { WebhookLogRepository } from './repositories/webhook-log.repository';

@Module({
  imports: [
    OrdersModule,
    AppConfigModule,
    MongooseModule.forFeature([{ name: WebhookLog.name, schema: WebhookLogSchema }]),
  ],
  controllers: [StripeWebhookController],
  providers: [WebhookLogRepository],
})
export class WebhooksModule {}

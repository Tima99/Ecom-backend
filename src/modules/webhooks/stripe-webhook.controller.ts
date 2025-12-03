import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { AppConfigService } from '../../core/config/config.service';
import { OrderService } from '../user/orders/services/order.service';
import { PaymentStatus, OrderStatus } from '../user/orders/schemas/order.schema';
import { WebhookLogRepository } from './repositories/webhook-log.repository';
import { StripeWebhookEvent, StripePaymentIntent } from '../../types/stripe.types';
import Stripe from 'stripe';

@Controller('webhooks')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(
    private configService: AppConfigService,
    private orderService: OrderService,
    private webhookLogRepository: WebhookLogRepository,
  ) {
    const { secretKey } = this.configService.stripeConfig;
    if (!secretKey) {
      throw new Error('Stripe secret key is not configured.');
    }
    this.stripe = new Stripe(secretKey);
  }

  @Post('stripe')
  async handleStripeWebhook(@Body() body: Buffer, @Headers('stripe-signature') signature: string) {
    const { webhookSecret } = this.configService.stripeConfig;

    let event: StripeWebhookEvent;

    try {
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret is not configured.');
      }
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      ) as StripeWebhookEvent;
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    await this.logWebhookEvent(event);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object);
          break;
        case 'payment_intent.requires_action':
          await this.handlePaymentRequiresAction(event.data.object);
          break;
      }
      await this.markWebhookProcessed(event.id);
    } catch (error) {
      await this.logWebhookError(event.id, error.message);
      throw error;
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: StripePaymentIntent) {
    const order = await this.orderService.findByPaymentId(paymentIntent.id);
    if (order) {
      await this.orderService.updatePaymentStatus(order._id.toString(), PaymentStatus.COMPLETED);
      await this.orderService.updateOrderStatus(order._id.toString(), OrderStatus.CONFIRMED);
    }
  }

  private async handlePaymentFailed(paymentIntent: StripePaymentIntent) {
    const order = await this.orderService.findByPaymentId(paymentIntent.id);
    if (order) {
      await this.orderService.updatePaymentStatus(order._id.toString(), PaymentStatus.FAILED);
    }
  }

  private async handlePaymentCanceled(paymentIntent: StripePaymentIntent) {
    const order = await this.orderService.findByPaymentId(paymentIntent.id);
    if (order) {
      await this.orderService.updatePaymentStatus(order._id.toString(), PaymentStatus.FAILED);
      await this.orderService.updateOrderStatus(order._id.toString(), OrderStatus.CANCELLED);
    }
  }

  private async handlePaymentRequiresAction(paymentIntent: StripePaymentIntent) {
    const order = await this.orderService.findByPaymentId(paymentIntent.id);
    if (order) {
      await this.orderService.updatePaymentStatus(order._id.toString(), PaymentStatus.PENDING);
    }
  }

  private async logWebhookEvent(event: StripeWebhookEvent) {
    const paymentIntent = event.data.object;
    const order = await this.orderService.findByPaymentId(paymentIntent.id);

    await this.webhookLogRepository.create({
      eventId: event.id,
      eventType: event.type,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      orderId: order?._id,
      processed: false,
      rawData: event,
    });
  }

  private async markWebhookProcessed(eventId: string) {
    await this.webhookLogRepository.markProcessed(eventId);
  }

  private async logWebhookError(eventId: string, error: string) {
    await this.webhookLogRepository.logError(eventId, error);
  }
}

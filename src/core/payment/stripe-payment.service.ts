import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { AppConfigService } from '../config/config.service';

export interface PaymentIntent {
  id: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor(private configService: AppConfigService) {
    const { secretKey } = this.configService.stripeConfig;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(amount: number, currency = 'inr'): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        payment_method_types: ['card'],
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      throw new BadRequestException(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        error: paymentIntent.status !== 'succeeded' ? `Payment ${paymentIntent.status}` : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: refund.status === 'succeeded',
        paymentId: refund.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

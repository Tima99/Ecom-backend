export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripePaymentIntent;
  };
  created: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: StripePaymentStatus;
  metadata: Record<string, string>;
  last_payment_error?: {
    code: string;
    message: string;
    type: string;
  };
}

export type StripePaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export interface WebhookLog {
  eventId: string;
  eventType: string;
  paymentIntentId: string;
  status: StripePaymentStatus;
  orderId?: string;
  processed: boolean;
  error?: string;
  timestamp: Date;
}

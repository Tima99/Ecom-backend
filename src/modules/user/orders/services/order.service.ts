import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  PaymentIntent,
  StripePaymentService,
} from '../../../../core/payment/stripe-payment.service';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { CreateOrderDto, CreatePaymentIntentDto, ProcessPaymentDto } from '../dto/order.dto';
import { OrderRepository } from '../repositories/order.repository';
import { OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    private stripePaymentService: StripePaymentService,
    private orderRepository: OrderRepository,
  ) {}

  async createOrder(
    userId: Types.ObjectId,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDocument> {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderNumber = this.generateOrderNumber();

    const order = await this.orderRepository.create({
      userId,
      orderNumber,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    // Clear cart after order creation
    await this.cartModel.updateOne({ userId }, { items: [], totalAmount: 0, totalItems: 0 });

    return order;
  }

  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentIntent> {
    const order = await this.orderRepository.findById(createPaymentIntentDto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Order payment already processed');
    }

    return this.stripePaymentService.createPaymentIntent(order.totalAmount);
  }

  async processPayment(orderId: string, paymentDto: ProcessPaymentDto): Promise<OrderDocument> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Confirm payment with Stripe
    const paymentResult = await this.stripePaymentService.confirmPayment(
      paymentDto.paymentIntentId,
    );

    if (paymentResult.success && paymentResult.paymentId) {
      await this.orderRepository.updatePaymentStatus(orderId, PaymentStatus.COMPLETED);
      await this.orderRepository.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
      await this.orderRepository.updatePaymentId(orderId, paymentResult.paymentId);
    } else {
      await this.orderRepository.updatePaymentStatus(orderId, PaymentStatus.FAILED);
    }

    const updatedOrder = await this.orderRepository.findById(orderId);
    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }
    return updatedOrder;
  }

  async getUserOrders(userId: Types.ObjectId): Promise<OrderDocument[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: string, userId: Types.ObjectId): Promise<OrderDocument> {
    const order = await this.orderRepository.findByUserIdAndOrderId(userId, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderDocument> {
    const order = await this.orderRepository.updateOrderStatus(orderId, status);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<OrderDocument> {
    const order = await this.orderRepository.updateTrackingNumber(orderId, trackingNumber);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByPaymentId(paymentId: string): Promise<OrderDocument | null> {
    return this.orderRepository.findByPaymentId(paymentId);
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<OrderDocument> {
    const order = await this.orderRepository.updatePaymentStatus(orderId, paymentStatus);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
}

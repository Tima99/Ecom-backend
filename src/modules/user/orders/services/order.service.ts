import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { CreateOrderDto, ProcessPaymentDto, CreatePaymentIntentDto } from '../dto/order.dto';
import { StripePaymentService, PaymentIntent } from '../../../../core/payment/stripe-payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    private stripePaymentService: StripePaymentService,
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

    const order = await this.orderModel.create({
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

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    const order = await this.orderModel.findById(createPaymentIntentDto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Order payment already processed');
    }

    return this.stripePaymentService.createPaymentIntent(order.totalAmount);
  }

  async processPayment(orderId: string, paymentDto: ProcessPaymentDto): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Confirm payment with Stripe
    const paymentResult = await this.stripePaymentService.confirmPayment(paymentDto.paymentIntentId);

    if (paymentResult.success && paymentResult.paymentId) {
      order.paymentStatus = PaymentStatus.COMPLETED;
      order.status = OrderStatus.CONFIRMED;
      order.paymentId = paymentResult.paymentId;
    } else {
      order.paymentStatus = PaymentStatus.FAILED;
    }

    await order.save();

    return order;
  }

  async getUserOrders(userId: Types.ObjectId): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId: string, userId: Types.ObjectId): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({ _id: orderId, userId });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { trackingNumber, status: OrderStatus.SHIPPED },
      { new: true },
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }


}

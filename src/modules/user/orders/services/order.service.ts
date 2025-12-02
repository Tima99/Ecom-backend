import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { CreateOrderDto, ProcessPaymentDto } from '../dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
  ) {}

  async createOrder(userId: Types.ObjectId, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
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

  async processPayment(orderId: string, paymentDto: ProcessPaymentDto): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Simulate payment processing
    const paymentSuccess = await this.simulatePayment(order.totalAmount, paymentDto);
    
    if (paymentSuccess) {
      order.paymentStatus = PaymentStatus.COMPLETED;
      order.status = OrderStatus.CONFIRMED;
      order.paymentId = `pay_${Date.now()}`;
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
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { trackingNumber, status: OrderStatus.SHIPPED },
      { new: true }
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private async simulatePayment(amount: number, paymentDto: ProcessPaymentDto): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 90% success rate for simulation
    return Math.random() > 0.1;
  }
}
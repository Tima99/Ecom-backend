import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  async create(orderData: Partial<Order>): Promise<OrderDocument> {
    return this.orderModel.create(orderData);
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findById(id);
  }

  async findByUserId(userId: Types.ObjectId): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findByUserIdAndOrderId(
    userId: Types.ObjectId,
    orderId: string,
  ): Promise<OrderDocument | null> {
    return this.orderModel.findOne({ _id: orderId, userId });
  }

  async findByPaymentId(paymentId: string): Promise<OrderDocument | null> {
    return this.orderModel.findOne({ paymentId });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderDocument | null> {
    return this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderDocument | null> {
    return this.orderModel.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
  }

  async updateTrackingNumber(
    orderId: string,
    trackingNumber: string,
  ): Promise<OrderDocument | null> {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { trackingNumber, status: OrderStatus.SHIPPED },
      { new: true },
    );
  }

  async updatePaymentId(orderId: string, paymentId: string): Promise<OrderDocument | null> {
    return this.orderModel.findByIdAndUpdate(orderId, { paymentId }, { new: true });
  }
}

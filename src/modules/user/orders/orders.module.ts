import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigModule } from '../../../core/config/config.module';
import { StripePaymentService } from '../../../core/payment/stripe-payment.service';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, StripePaymentService, OrderRepository],
  exports: [OrderService],
})
export class OrdersModule {}

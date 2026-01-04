import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CreateOrderDto, CreatePaymentIntentDto, ProcessPaymentDto } from '../dto/order.dto';
import { OrderService } from '../services/order.service';

@ApiTags('User - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(user.userId, createOrderDto);
  }

  @Post('payment-intent')
  @ApiOperation({ summary: 'Create payment intent for order' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.orderService.createPaymentIntent(createPaymentIntentDto);
  }

  @Post(':orderId/payment')
  @ApiOperation({ summary: 'Process payment for order' })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  async processPayment(@Param('orderId') orderId: string, @Body() paymentDto: ProcessPaymentDto) {
    return this.orderService.processPayment(orderId, paymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user order history' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getUserOrders(@CurrentUser() user: any) {
    return this.orderService.getUserOrders(user.userId);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order details retrieved' })
  async getOrderById(@CurrentUser() user: any, @Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId, user.userId);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RegisterDeviceDto, SendNotificationDto } from '../dto/notification.dto';
import { NotificationService } from '../services/notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send notification' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationService.sendNotification(sendNotificationDto);
  }

  @Post('register-device')
  @ApiOperation({ summary: 'Register device token' })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  async registerDevice(
    @CurrentUser() user: { userId: string },
    @Body() registerDeviceDto: RegisterDeviceDto,
  ) {
    await this.notificationService.registerDevice(user.userId, registerDeviceDto);
    return { success: true };
  }

  @Get('device-tokens/:userId')
  @ApiOperation({ summary: 'Get user device tokens' })
  @ApiResponse({ status: 200, description: 'Device tokens retrieved' })
  async getUserDeviceTokens(@Param('userId') userId: string) {
    const tokens = await this.notificationService.getUserDeviceTokens(userId);
    return { tokens };
  }
}

import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginDto, ToggleTwoFactorDto, VerifyTwoFactorDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthLoginController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const deviceInfo = {
      deviceInfo: req.headers['x-device-info'] || 'Unknown Device',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown IP',
      userAgent: req.headers['user-agent'] || 'Unknown User Agent',
    };

    return this.authService.login(loginDto, deviceInfo);
  }

  @Post('verify-2fa')
  async verifyTwoFactor(@Body() verifyDto: VerifyTwoFactorDto) {
    return this.authService.verifyTwoFactor(verifyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('request-2fa-toggle')
  async requestTwoFactorToggle(@CurrentUser() user: any) {
    return this.authService.requestTwoFactorToggle(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-2fa-toggle')
  async confirmTwoFactorToggle(@Body() toggleDto: ToggleTwoFactorDto, @CurrentUser() user: any) {
    return this.authService.confirmTwoFactorToggle(user.userId, toggleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAllDevices(@CurrentUser() user: any) {
    return this.authService.logoutAllDevices(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getActiveSessions(@CurrentUser() user: any) {
    return this.authService.getActiveSessions(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  async logoutSpecificDevice(@Param('sessionId') sessionId: string) {
    return this.authService.logout(sessionId);
  }
}

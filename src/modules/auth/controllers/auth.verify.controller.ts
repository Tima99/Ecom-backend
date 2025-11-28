import { Body, Controller, Post } from '@nestjs/common';

import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { VerifyEmailService } from '../services/verify-email.service';

@Controller('auth')
export class AuthVerifyController {
  constructor(private readonly verifyEmailService: VerifyEmailService) {}

  @Post('request-otp')
  requestOtp(@Body() body: RequestOtpDto) {
    return this.verifyEmailService.generateOtp(body.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.verifyEmailService.verifyOtp(body.email, body.otp);
  }
}

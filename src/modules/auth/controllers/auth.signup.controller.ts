import { Body, Controller, Post } from '@nestjs/common';

import { SignupDto } from '../dto/signup.dto';
import { SignupService } from '../services/signup.service';

@Controller('auth')
export class AuthSignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.signupService.signup(body.email, body.password, body.name);
  }
}

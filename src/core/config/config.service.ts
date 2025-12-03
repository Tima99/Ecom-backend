import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get emailConfig() {
    return {
      user: this.configService.get<string>('EMAIL_USER'),
      pass: this.configService.get<string>('EMAIL_PASS'),
      from: this.configService.get<string>('EMAIL_FROM'),
      service: this.configService.get<string>('EMAIL_SERVICE', 'gmail'),
    };
  }

  get appConfig() {
    return {
      name: this.configService.get<string>('APP_NAME'),
      port: this.configService.get<number>('PORT', 3000),
      domain: this.configService.get<string>('APP_DOMAIN', 'http://localhost'),
    };
  }

  get databaseConfig() {
    return {
      url: this.configService.get<string>('DATABASE_URL'),
    };
  }

  get stripeConfig() {
    return {
      secretKey: this.configService.get<string>('STRIPE_SECRET_KEY'),
      publishableKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY'),
      webhookSecret: this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
    };
  }
}

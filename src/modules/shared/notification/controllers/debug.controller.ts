import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppConfigService } from '../../../../core/config/config.service';
import { FirebaseService } from '../../../../core/firebase/firebase.service';

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  constructor(
    private firebaseService: FirebaseService,
    private configService: AppConfigService,
  ) {}

  @Get('firebase-config')
  @ApiOperation({ summary: 'Check Firebase configuration' })
  getFirebaseConfig() {
    const config = this.configService.firebaseConfig;
    return {
      projectId: config.projectId,
      hasClientEmail: !!config.clientEmail,
      hasPrivateKey: !!config.privateKey,
      privateKeyLength: config.privateKey?.length || 0,
    };
  }

  @Post('test-firebase')
  @ApiOperation({ summary: 'Test Firebase directly' })
  async testFirebase(@Body() body: { token: string }) {
    try {
      const result = await this.firebaseService.sendToDevice(body.token, {
        title: 'Direct Firebase Test',
        body: 'Testing Firebase connection directly',
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        stack: error.stack,
        tokenUsed: body.token,
      };
    }
  }

  @Post('validate-token')
  @ApiOperation({ summary: 'Validate FCM token format' })
  validateToken(@Body() body: { token: string }) {
    const token = body.token;
    return {
      tokenLength: token.length,
      hasColon: token.includes(':'),
      startsWithValid: token.match(/^[a-zA-Z0-9_-]+:/),
      isValidFormat: token.match(/^[a-zA-Z0-9_-]+:APA91b[a-zA-Z0-9_-]+$/),
    };
  }
}

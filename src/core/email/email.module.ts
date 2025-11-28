import { Module } from '@nestjs/common';

import { AppConfigModule } from '../config/config.module';
import { EmailAdapter } from './adapters/email.adapter';
import { NodemailerAdapter } from './adapters/nodemailer.adapter';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

@Module({
  imports: [AppConfigModule],
  providers: [
    EmailService,
    TemplateService,
    { provide: EmailAdapter, useClass: NodemailerAdapter },
  ],
  exports: [EmailService],
})
export class EmailModule {}

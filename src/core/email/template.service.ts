import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

import { TemplateName } from '../../types/email/template-types';

export interface TemplateVariables {
  [key: string]: string | number;
}

@Injectable()
export class TemplateService {
  private readonly templatesPath = join(__dirname, 'templates');

  renderTemplate(templateName: TemplateName, variables: TemplateVariables): string {
    const templatePath = join(this.templatesPath, `${templateName}.html`);
    let template = readFileSync(templatePath, 'utf-8');

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, String(value));
    });

    return template;
  }

  renderOtpTemplate(otp: string, userName: string = 'User'): string {
    return this.renderTemplate('otp-verification', {
      appName: 'Ecommerce App',
      userName,
      otp,
      expiryMinutes: 10,
      currentYear: new Date().getFullYear(),
    });
  }

  renderWelcomeTemplate(userName: string): string {
    return this.renderTemplate('welcome', {
      appName: 'Ecommerce App',
      userName,
      currentYear: new Date().getFullYear(),
    });
  }

  renderTwoFactorOtpTemplate(otp: string): string {
    return this.renderTemplate('two-factor-otp', {
      appName: 'Ecommerce App',
      otp,
      expiryMinutes: 10,
      currentYear: new Date().getFullYear(),
    });
  }
}

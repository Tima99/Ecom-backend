import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './core/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = app.get(ConfigService);

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Swagger Config
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get('APP_NAME') ?? 'API Docs')
    .setDescription('E-commerce backend API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const docRoutes = 'docs';
  SwaggerModule.setup(docRoutes, app, document);

  // Add log for swagger routes
  const domain = config.get<number>('APP_DOMAIN');
  const port = config.get<number>('PORT') ?? 3000;

  console.log(`📝 Swagger docs available at ${domain}/${docRoutes}`);

  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}

void bootstrap();

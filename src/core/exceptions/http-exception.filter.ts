import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const error = isHttpException ? exception.getResponse() : 'Unexpected server error';

    // Log error to console
    console.error('Exception caught:', {
      status,
      error,
      stack: exception instanceof Error ? exception.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
    });

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      error,
    });
  }
}

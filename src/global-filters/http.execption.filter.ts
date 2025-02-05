import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private nodeEnv: string) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    // Access the error object directly from the exception
    const errorResponse = (exception as any).response;
    console.log('errorResponse:', errorResponse);

    const isProduction = this.nodeEnv === 'production';
    console.log('isProduction:', isProduction);

    this.logger.error(
      `Exception: ${exception.message}, statusCode: ${statusCode}, url: ${request.url}, method: ${request.method}, ip: ${request.ip}`,
    );

    return response.status(statusCode).json(
      isProduction
        ? {
            status: 'error',
            statusCode,
            timestamp: new Date().toISOString(),
            message: exception.message,
          }
        : {
            ...errorResponse,
          },
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

interface RpcExceptionResponse {
  status: string;
  statusCode: number;
  message: string;
  error: any;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    // Access the error object directly from the exception
    const errorResponse = (exception as any).response;
    console.log('errorResponse:', errorResponse);

    const isProduction =
      this.configService.get<string>('NODE_ENV', { infer: true }) ===
      'production';

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

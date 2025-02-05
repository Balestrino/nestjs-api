import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { HttpAdapterHost } from '@nestjs/core';
// import { exec } from 'child_process';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private nodeEnv: string,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    console.log('exception:', exception);
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    // const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    // Access the error object directly from the exception
    // const errorResponse = (exception as any).response;

    const isProduction = this.nodeEnv === 'production';

    this.logger.error(
      `Exception: ${exception.message}, statusCode: ${statusCode}, url: ${request.url}, method: ${request.method}, ip: ${request.ip}`,
    );

    // This is the error that is displayed to the user (production mode)
    const responseBody = {
      status: exception.status || 'error',
      statusCode: exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message || 'Internal Server error 😒',
    };

    httpAdapter.reply(
      ctx.getResponse(),
      isProduction ? responseBody : exception,
      // responseBody, // This is the production response body
      exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    // const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `Exception: ${exception.message}, stack: ${exception.stack}, request: ${request.url}`,
    );

    const responseBody = {
      status: exception.status || 'error',
      statusCode: exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message || 'Internal Server error 😒',
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

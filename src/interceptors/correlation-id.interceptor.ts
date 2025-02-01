// correlation-id.interceptor.ts
// TODO: REMOVE THIS FILE
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    console.log('request: ', request.originalUrl);

    this.cls.run(() => {
      const correlationId = request.headers['x-correlation-id'] || uuidv4();
      this.cls.set('correlationId', correlationId);
      console.log(`INTERCEPTOR Correlation ID: ${correlationId}`);
    });
    return next.handle();
  }
}

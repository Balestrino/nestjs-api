// TODO: REMOVE THIS FILE
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { CustomClsServiceProvider } from '../cls/custom-cls-service.provider';

@Injectable()
export class RequestIpInterceptor implements NestInterceptor {
  constructor(private readonly clsService: CustomClsServiceProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.socket.remoteAddress;

    this.clsService.set('ip', ip);

    return next.handle();
  }
}

// TODO: REMOVE THIS FILE
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class NatsContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const clsId = this.cls.getId();
    const clsContext = this.cls.get('user');

    // Attach CLS context to NATS message
    request.natsContext = {
      clsId,
      context: clsContext,
    };

    return next.handle();
  }
}

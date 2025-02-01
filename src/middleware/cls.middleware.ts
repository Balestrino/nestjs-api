// cls.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ClsMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.cls.run(() => {
      // Set correlation ID from header or generate new
      const correlationId =
        req.headers['x-correlation-id'] || crypto.randomUUID();
      this.cls.set('correlationId', correlationId);

      // Make it available in response headers
      res.setHeader('x-correlation-id', correlationId);
      console.log(`MIDDLEWARE Correlation ID: ${correlationId}`);
      next();
    });
  }
}

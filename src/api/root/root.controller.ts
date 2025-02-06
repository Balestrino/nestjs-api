import { Controller, Get, UseInterceptors, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { RootService } from './root.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller({
  path: '',
  version: '1',
})
@ApiTags('/')
export class RootController {
  constructor(
    private readonly rootService: RootService,
    private readonly logger: Logger,
  ) {}

  @Get('healthcheck')
  healthCheck(@Payload() message: any) {
    return this.rootService.healthCheck(message);
  }

  @Get('error')
  error() {
    return this.rootService.error();
  }
}

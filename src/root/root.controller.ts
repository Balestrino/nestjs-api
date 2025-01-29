import { Controller, Get } from '@nestjs/common';
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
  constructor(private readonly rootService: RootService) {}

  @Get()
  getHello(): string {
    return this.rootService.getHello();
  }
}

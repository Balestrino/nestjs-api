import { Module } from '@nestjs/common';
import { RootController } from './root/root.controller';
import { RootService } from './root/root.service';
import { ConfigModule } from '@nestjs/config';
import { RootModule } from './root/root.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    RootModule,
  ],
  controllers: [RootController],
  providers: [RootService],
})
export class AppModule {}

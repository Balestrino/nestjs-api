import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls'; // Import ClsModule and ClsService
import { RootController } from './root/root.controller';
import { RootService } from './root/root.service';
import { ConfigModule } from '@nestjs/config';
import { RootModule } from './root/root.module';
import { UsersModule } from './users/users.module';
import { configuration } from './config/configuration';
import { ClsMiddleware } from './middleware/cls.middleware';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    ClsModule.forRoot({ middleware: { mount: true } }),
    RootModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [RootController],
  providers: [RootService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes('*');
  }
}

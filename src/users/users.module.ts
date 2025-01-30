import { Module } from '@nestjs/common';
import { ClientsModule, Transport, NatsOptions } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): NatsOptions => ({
          transport: Transport.NATS,
          options: {
            servers: [
              `nats://${configService.getOrThrow<string>('app.natsHost', { infer: true })}:${configService.getOrThrow<string>('app.natsPort', { infer: true })}`,
            ],
            queue: 'user_queue',
            // stream: {
            //   name: 'user_stream', // The name of the stream
            //   subjects: ['user.*'], // The subjects to listen to
            //   retention: 'workQueue', // The retention policy for the stream
            //   maxConsumers: -1, // The maximum number of consumers that can subscribe to the stream
            // },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, ClientsModule],
})
export class UsersModule {}

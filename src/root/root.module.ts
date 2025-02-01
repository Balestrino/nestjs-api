import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, NatsOptions } from '@nestjs/microservices';
import { RootService } from './root.service';
import { RootController } from './root.controller';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'ROOT_SERVICE',
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
  providers: [RootService],
  controllers: [RootController],
  exports: [RootService, ClientsModule],
})
export class RootModule {}

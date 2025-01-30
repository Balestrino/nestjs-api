import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClientProxy, Transport } from '@nestjs/microservices';
import helmet from 'helmet';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService<AllConfigType>);
  // app.use(helmet());
  // app.enableCors({
  //   origin: 'http://192.168.88.138:3000',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  // app.connectMicroservice({
  //   transport: Transport.NATS,
  //   options: {
  //     servers: [
  //       `nats://${configService.getOrThrow<string>('app.natsHost', { infer: true })}:${configService.getOrThrow<string>('app.natsPort', { infer: true })}`,
  //     ],
  //   },
  // });

  // Enable shutdown hooks
  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow<string>('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes any properties from the incoming request body that are not defined in the DTO. This helps prevent overposting attacks
      transform: true, // Automatically transforms incoming data to match the types defined in the DTO
      transformOptions: {
        enableImplicitConversion: true, // Enables implicit type conversions, such as converting strings to numbers or booleans
      },
      forbidNonWhitelisted: true, // Forbid extra properties
      forbidUnknownValues: true, // Forbid unknown values in the incoming request body
    }),
  );

  // SwaggerModule
  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
  // Print NODE_ENV
  console.log(
    'NODE_ENV:',
    configService.getOrThrow('app.nodeEnv', { infer: true }),
  );
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();

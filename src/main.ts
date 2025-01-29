import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  app.use(helmet());

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow<string>('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

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

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
  // Print NODE_ENV
  console.log(
    'NODE_ENV:',
    configService.getOrThrow('app.nodeEnv', { infer: true }),
  );
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();

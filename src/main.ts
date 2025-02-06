import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
// import helmet from 'helmet';
import { AllExceptionsFilter } from './global-filters/all.execptions.filter';
// import { HttpExceptionFilter } from './global-filters/http.execption.filter';
// import { GlobalRpcExceptionFilter } from './global-filters/rpc.execption.filter';
import { validateEnv } from './config/env.validation';
import { LoggerFactory } from './logger/logger.factory';

import { otelSDK } from './tracer/metrics';

async function bootstrap() {
  // Validate environment variables first
  const validatedEnv = validateEnv(process.env);
  // Start the OpenTelemetry tracer
  otelSDK.start();
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory(validatedEnv),
    cors: true,
  });
  // app.use(helmet());
  // app.enableCors({
  //   origin: 'http://192.168.88.138:3000',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  // Add global filters
  // Filters are executed in reverse order (last to first)
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, validatedEnv.NODE_ENV),
    // new HttpExceptionFilter(validatedEnv.NODE_ENV),
    // new GlobalRpcExceptionFilter(),
  ); // TODO: check this

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Set the global prefix
  app.setGlobalPrefix(validatedEnv.API_PREFIX, {
    exclude: ['/'],
  });

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable validation pipe
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

  await app.listen(validatedEnv.APP_PORT);
  // Print NODE_ENV
  Logger.log(`NODE_ENV: ${validatedEnv.APP_PORT}`);
  Logger.log(`Application is running on: ${await app.getUrl()}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}
void bootstrap();

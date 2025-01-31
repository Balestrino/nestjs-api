import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './global-filters/all.execptions.filter';
import { HttpExceptionFilter } from './global-filters/http.execption.filter';
import { GlobalRpcExceptionFilter } from './global-filters/rpc.execption.filter';
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

  // Add global filters
  // Filters are executed in reverse order (last to first)
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new HttpExceptionFilter(configService),
    new GlobalRpcExceptionFilter(),
  );

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

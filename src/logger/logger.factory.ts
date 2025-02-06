import { Logger } from '@nestjs/common';
import winston, { transports, format } from 'winston';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import * as logsAPI from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

export const LoggerFactory = (validatedEnv) => {
  Logger.log(
    `LoggerFactory appName: ${validatedEnv.APP_NAME} in ${validatedEnv.NODE_ENV} mode`,
  );

  const logExporterOptions = 'http://192.168.88.120:4318/v1/logs';

  // Initialize the Logger provider
  const loggerProvider = new LoggerProvider({
    resource: new Resource({
      'service.name': validatedEnv.APP_NAME,
      'service.version': validatedEnv.APP_VERSION,
      'deployment.environment': validatedEnv.NODE_ENV || 'development',
    }),
  });

  // Configure OTLP exporter
  const otlpLogExporter = new OTLPLogExporter({
    url: logExporterOptions,
    headers: {
      'Content-Type': 'application/json',
      // Add any required headers for your OpenTelemetry backend
      // 'Authorization': `Bearer ${process.env.OTLP_API_KEY}`,
    },
    timeoutMillis: 5000, // 5 second timeout
    concurrencyLimit: 10, // Limit concurrent requests
  });

  loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(otlpLogExporter),
  );

  loggerProvider.addLogRecordProcessor({
    onEmit: (record) => {
      Logger.log('Log Record Sent:', record);
    },
    shutdown: () => Promise.resolve(),
    forceFlush: () => Promise.resolve(),
  });

  // Set the global logger provider
  logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

  let consoleFormat;

  if (validatedEnv.NODE_ENV === 'production') {
    consoleFormat = format.combine(
      format.ms(),
      format.timestamp(),
      format.errors({
        stack: true,
      }),
      format.metadata(),
      format.json(),
    );
  } else {
    consoleFormat = format.combine(
      format.timestamp(),
      format.ms(),
      format.metadata(),
      format.json(),
      nestWinstonModuleUtilities.format.nestLike(validatedEnv.APP_NAME, {
        colors: true,
        prettyPrint: true,
      }),
    );
  }

  return WinstonModule.createLogger({
    level: validatedEnv.NODE_ENV === 'production' ? 'info' : 'debug',
    defaultMeta: {
      service: validatedEnv.APP_NAME,
      environment: validatedEnv.NODE_ENV || 'development',
    },
    transports: [
      new transports.Console({ format: consoleFormat }),
      new OpenTelemetryTransportV3({
        // @ts-expect-error: loggerProvider error
        loggerProvider: loggerProvider,
        logResourceLabels: true,
      }),
    ],
    exitOnError: false, // do not exit on handled exceptions
  });
};

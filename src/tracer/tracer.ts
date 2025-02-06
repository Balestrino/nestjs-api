import {
  getNodeAutoInstrumentations,
  getResourceDetectors,
} from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

import { validateEnv } from '../config/env.validation';

const validatedEnv = validateEnv(process.env); // Validate environment variables first

// Enable logging for debugging
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Configure the SDK to export telemetry data to the console
// Enable all auto-instrumentations from the meta package
const exporterOptions = {
  url: 'http://192.168.88.120:4318/v1/traces',
};

const serviceName = validatedEnv.APP_NAME;

const traceExporter = new OTLPTraceExporter(exporterOptions);

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [
    ...getNodeAutoInstrumentations(),
    new WinstonInstrumentation(),
  ],
  resource: new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: '0.1',
  }),
  resourceDetectors: getResourceDetectors(),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter()),
});

// initialize the SDK and register with the OpenTelemetry API
try {
  sdk.start();
  diag.info('OpenTelemetry automatic instrumentation started successfully');
} catch (error) {
  diag.error(
    'Error initializing OpenTelemetry SDK. Your application is not instrumented and will not produce telemetry',
    error,
  );
}

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

export default sdk;

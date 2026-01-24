/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {Resource} from '@opentelemetry/resources';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import * as dotenv from 'dotenv';
import {ExpressInstrumentation} from "@opentelemetry/instrumentation-express";
import {getNodeAutoInstrumentations} from "@opentelemetry/auto-instrumentations-node";

dotenv.config();

const traceExporter = new OTLPTraceExporter({
    url: 'https://us-east-1.aws.edge.axiom.co/v1/traces',
    headers: {
        'Authorization': `Bearer ${process.env.AXIOM_API_KEY}`,
        'X-Axiom-Dataset': 'cabildo-abierto'
    }
});

const sdk = new NodeSDK({
    traceExporter,
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'ca-backend',
    }),
    instrumentations: [
        getNodeAutoInstrumentations()
    ]
});

sdk.start();

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});

console.log('OpenTelemetry instrumentation initialized');
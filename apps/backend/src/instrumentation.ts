import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import {DiagConsoleLogger, DiagLogLevel, diag} from "@opentelemetry/api";
import { NodeSdk } from "@effect/opentelemetry";
import {make} from "effect/ManagedRuntime"
import * as dotenv from 'dotenv';
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";

dotenv.config();

const LOG_IN_TEST = false
const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

if(isDev) {
    diag.setLogger(new DiagConsoleLogger(), {
        logLevel: DiagLogLevel.ERROR,
        suppressOverrideMessage: true
    });
}

const traceExporter = isTest && LOG_IN_TEST
    ? new ConsoleSpanExporter()
    : new OTLPTraceExporter({
        url: isDev
            ? 'http://127.0.0.1:4318/v1/traces'
            : 'https://us-east-1.aws.edge.axiom.co/v1/traces',
        headers: isDev ? {} : {
            'Authorization': `Bearer ${process.env.AXIOM_API_KEY}`,
            'X-Axiom-Dataset': 'cabildo-abierto'
        }
    });
const spanProcessor = isTest && LOG_IN_TEST
    ? new SimpleSpanProcessor(traceExporter)
    : new BatchSpanProcessor(traceExporter);

export const NodeSdkLive = NodeSdk.layer(() => ({
    resource: {
        serviceName: process.env.SERVICE_NAME ?? 'cabildo-backend',
        serviceVersion: "1.0.1",
        attributes: {
            "dev": process.env.DEV_NAME ?? "anonymous"
        }
    },
    spanProcessor,
    instrumentations: [getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
            enabled: false
        },
    })]
}))

export const runtime = make(NodeSdkLive)

console.log('OpenTelemetry instrumentation initialized');

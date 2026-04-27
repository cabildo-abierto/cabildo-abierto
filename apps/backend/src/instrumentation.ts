import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSdk } from "@effect/opentelemetry";
import {make} from "effect/ManagedRuntime"
import * as dotenv from 'dotenv';
import { BatchSpanProcessor, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { PrettyConsoleSpanExporter } from "#/pretty-console-span-exporter.js";

dotenv.config();

const LOG_IN_TEST = false
const isTest = process.env.NODE_ENV === 'test';
const logToConsole = process.env.LOG_TO_CONSOLE == "1" || isTest && LOG_IN_TEST
console.log("logToConsole", logToConsole)
const traceExporter = logToConsole
    ? new PrettyConsoleSpanExporter()
    : new OTLPTraceExporter({
        url: 'https://us-east-1.aws.edge.axiom.co/v1/traces',
        headers: {
            'Authorization': `Bearer ${process.env.AXIOM_API_KEY}`,
            'X-Axiom-Dataset': 'cabildo-abierto'
        }
    });
const spanProcessor = logToConsole
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
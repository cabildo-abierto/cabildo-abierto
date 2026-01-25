import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSdk } from "@effect/opentelemetry";
import {make} from "effect/ManagedRuntime"
import * as dotenv from 'dotenv';
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

dotenv.config();

const traceExporter = new OTLPTraceExporter({
    url: 'https://us-east-1.aws.edge.axiom.co/v1/traces',
    headers: {
        'Authorization': `Bearer ${process.env.AXIOM_API_KEY}`,
        'X-Axiom-Dataset': 'cabildo-abierto'
    }
})


export const NodeSdkLive = NodeSdk.layer(() => ({
    resource: {
        serviceName: "ca-backend",
        serviceVersion: "1.0.1"
    },
    spanProcessor: new BatchSpanProcessor(traceExporter),
    instrumentations: [getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
            enabled: false
        },
    })]
}))

export const runtime = make(NodeSdkLive)

console.log('OpenTelemetry instrumentation initialized');
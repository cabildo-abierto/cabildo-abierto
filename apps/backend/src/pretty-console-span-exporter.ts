import {ExportResult, ExportResultCode, hrTimeToMilliseconds} from "@opentelemetry/core"
import {inspect} from "node:util"
import type {ReadableSpan, SpanExporter} from "@opentelemetry/sdk-trace-base"

function shortId(id: string | undefined, n = 8): string {
    if (!id) {
        return "—"
    }
    return id.length <= n ? id : `${id.slice(0, n)}…`
}

/**
 * Human-readable span lines for local dev. Prints to **stderr** so stdout can stay
 * valid Pino JSON when you run `… | pino-pretty`.
 */
export class PrettyConsoleSpanExporter implements SpanExporter {
    export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
        for (const span of spans) {
            const sc = span.spanContext()
            const ms = hrTimeToMilliseconds(span.duration)
            const title = `\n\x1b[36motel\x1b[0m \x1b[2m${ms.toFixed(1)}ms\x1b[0m  \x1b[1m${span.name}\x1b[0m`
            const meta = `\x1b[2mtrace=${shortId(sc.traceId)}  span=${shortId(sc.spanId)}  parent=${span.parentSpanId ? shortId(span.parentSpanId) : "—"}\x1b[0m`
            const attrs =
                span.attributes && Object.keys(span.attributes).length > 0
                    ? inspect(span.attributes, {
                          colors: process.stderr.isTTY,
                          depth: 3,
                          breakLength: 120,
                          compact: false
                      })
                    : null
            const status =
                span.status?.code === 2
                    ? inspect(span.status, {colors: process.stderr.isTTY})
                    : null

            // eslint-disable-next-line no-console
            console.error([title, meta, attrs, status].filter(Boolean).join("\n"))
        }
        resultCallback({code: ExportResultCode.SUCCESS})
    }

    shutdown(): Promise<void> {
        return this.forceFlush()
    }

    forceFlush(): Promise<void> {
        return Promise.resolve()
    }
}

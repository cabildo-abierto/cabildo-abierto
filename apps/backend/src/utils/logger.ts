import pino from "pino";
import {prettyFactory} from "pino-pretty";
import {Writable} from "stream";
import {env} from "#/lib/env.js";

function createConsoleLogDestination(): Writable {
    const prettify = prettyFactory({sync: true, colorize: true});
    return new Writable({
        write(chunk, _enc, cb) {
            try {
                console.log(prettify(chunk.toString()));
            } catch {
                console.log(chunk.toString());
            }
            cb();
        },
    });
}

export class Logger {
    pino: pino.Logger;

    constructor(name: string) {
        const level =
            env.NODE_ENV === "test"
                ? process.env.LOG_IN_TESTS === "true"
                    ? "info"
                    : "silent"
                : "info";

        const logInTests = env.NODE_ENV === "test" && process.env.LOG_IN_TESTS === "true";

        this.pino = logInTests
            ? pino({name, level}, createConsoleLogDestination())
            : pino({name, level});
    }

    logTimes(msg: string, times: number[], object?: Record<string, unknown>){
        const diffs: number[] = []
        for(let i = 1; i < times.length; i++){
            diffs.push(times[i]-times[i-1])
        }
        const sum = diffs.join(" + ")

        this.pino.info({...object, elapsed: `${times[times.length-1]-times[0]} = ${sum}`}, msg)
    }
}
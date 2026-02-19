import pino from "pino";
import {env} from "#/lib/env.js";



export class Logger {
    pino: pino.Logger

    constructor(name: string) {
        this.pino = pino({name, level: env.NODE_ENV == "test" ? "silent" : "info"})
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
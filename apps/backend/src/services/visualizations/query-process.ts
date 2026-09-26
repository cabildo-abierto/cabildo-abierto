import {fork} from 'node:child_process';
import type {DatasetColumn, DatasetCell, DatasetReference, LccaAnalysis, LccaOutput} from '@cabildo-abierto/api';
import {TopicActionError} from '../topic-title-edits.js';
export type QueryTable = DatasetReference & {versionId: string; columns: DatasetColumn[]; rows: DatasetCell[][]};
export type QueryJob = {type: 'analyze' | 'execute'; query: string; tables?: QueryTable[]; resolvedTopicIds?: Record<string,string>};
let active = 0;
const queue: (() => void)[] = [];
export async function runQueryJob<T extends LccaAnalysis | LccaOutput>(job: QueryJob): Promise<T> {
    if (queue.length >= 20) throw new TopicActionError(429, 'Hay demasiadas consultas en curso. Reintentá en unos segundos.');
    await new Promise<void>(resolve => {
        const acquire = () => { active++; resolve(); };
        if (active < 2) acquire(); else queue.push(acquire);
    });
    try {
        return await new Promise<T>((resolve, reject) => {
            const dev = import.meta.url.endsWith('.ts');
            const child = fork(new URL(dev ? './query-worker.ts' : './lcca-worker.js', import.meta.url), [], {execArgv: dev ? process.execArgv : [], stdio: ['ignore', 'ignore', 'pipe', 'ipc']});
            child.stderr?.resume();
            let settled = false;
            const finish = (error?: Error, value?: T) => {
                if (settled) return;
                settled = true; clearTimeout(timer); child.kill('SIGKILL');
                if (error) reject(error); else resolve(value!);
            };
            const timer = setTimeout(() => finish(new TopicActionError(408, 'La consulta excedió los 15 segundos permitidos.')), 15000);
            child.once('error', error => finish(error));
            child.once('exit', () => finish(new Error('El proceso de consulta terminó inesperadamente.')));
            child.once('message', (result: any) => finish(result.success ? undefined : new TopicActionError(400, result.error), result.value));
            child.send(job, error => { if (error) finish(error); });
        });
    } finally { active--; queue.shift()?.(); }
}

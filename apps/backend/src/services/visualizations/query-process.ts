import {PersistentWorker} from '../workers/persistent-worker.js';
import type {DatasetColumn, CSVOptions, DatasetReference, LccaAnalysis, LccaOutput} from '@cabildo-abierto/api';
export type QueryTable = DatasetReference & {versionId: string; columns: DatasetColumn[]; snapshotId: string; url: string; sourceColumns: DatasetColumn[]; csvOptions: CSVOptions; rowCount: number; columnBytes: number[]};
export type QueryJob = {type: 'analyze' | 'execute'; query: string; tables?: QueryTable[]; resolvedTopicIds?: Record<string,string>};
const dev = import.meta.url.endsWith('.ts');
const worker = new PersistentWorker(new URL(dev ? './query-worker.ts' : './lcca-worker.js', import.meta.url),
    dev ? process.execArgv : [], 'La consulta excedió los 15 segundos permitidos.');
export function warmQueryWorker() { worker.warm(); }
export async function runQueryJob<T extends LccaAnalysis | LccaOutput>(job: QueryJob): Promise<T> {
    const started = Date.now();
    try { return await worker.run<T>(job, 15000); }
    finally {
        if (job.type === 'execute') console.info(JSON.stringify({event: 'dataset_query_finished', durationMs: Date.now() - started}));
    }
}

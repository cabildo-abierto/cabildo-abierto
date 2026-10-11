import {PersistentWorker} from '../workers/persistent-worker.js';
import {env} from '#/lib/env.js';
import {fork} from 'node:child_process';
import {TopicActionError} from '../topic-title-edits.js';
import {createDatasetSlot} from './preparation-slots.js';
import {rm} from 'node:fs/promises';
const dev = import.meta.url.endsWith('.ts');
function workerFile(worker: 'prepare' | 'page' | 'search') {
    return new URL(dev ? `./${worker}-worker.ts` : `${import.meta.url.includes('/scripts/') ? '../' : './'}dataset-${worker}-worker.js`, import.meta.url);
}
const pageWorker = new PersistentWorker(workerFile('page'), dev ? process.execArgv : [],
    'La preparación o lectura del dataset superó el tiempo permitido.');
export function warmDatasetPageWorker() { pageWorker.warm(); }
const prepareWorkerSlot = createDatasetSlot(1);
const workerSlot = createDatasetSlot(2);
export async function datasetJob<T>(worker:'prepare'|'page'|'search',job:object,seconds:number):Promise<T> {
    if (worker === 'page') return pageWorker.run<T>(job, seconds * 1000);
    const releasePrepare = worker === 'prepare' ? await prepareWorkerSlot() : undefined;
    let releaseWorker: (() => void) | undefined;
    const csv = worker === 'prepare' && (!('format' in job) || job.format !== 'json');
    try {
        releaseWorker = await workerSlot();
        return await new Promise<T>((resolve,reject)=>{
            const child=fork(workerFile(worker),[],{execArgv:[...(dev ? process.execArgv : []), ...(worker === 'prepare' ? [`--max-old-space-size=${csv ? env.DATASET_CSV_PREPARE_HEAP_MB : env.DATASET_PREPARE_MEMORY_MB}`] : [])],stdio:['ignore','ignore','ignore','ipc']});
            let done=false;
            const finish=(error?:Error,value?:T)=>{
                if(done)return;
                done=true;clearTimeout(timer);
                const complete=()=>{if(error)reject(error);else resolve(value!);};
                if(!child.pid || child.exitCode!==null || child.signalCode!==null)complete();
                else {child.once('exit',complete);child.kill('SIGKILL');}
            };
            const timer=setTimeout(()=>finish(new TopicActionError(408,'La preparación o lectura del dataset superó el tiempo permitido.')),seconds*1000);
            child.once('error',error=>finish(error));
            child.once('exit',()=>finish(new Error('El proceso del dataset terminó inesperadamente.')));
            child.once('message',(result:any)=>finish(result.success ? undefined : new TopicActionError(400,result.error),result.value));
            child.send(job,error=>{if(error)finish(error);});
        });
    } finally {
        try {
            // Also clean up if the worker was killed on timeout or exited early.
            if (csv && 'output' in job && typeof job.output === 'string') await Promise.all(['normalized', 'extracted'].map(suffix => rm(`${job.output}.${suffix}.csv`, {force: true})));
        } finally { releaseWorker?.(); releasePrepare?.(); }
    }
}

import {env} from '#/lib/env.js';
import {fork} from 'node:child_process';
import {TopicActionError} from '../topic-title-edits.js';
let active = 0;
const queue: (()=>void)[] = [];
export async function datasetJob<T>(worker:'prepare'|'page'|'search',job:object,seconds:number):Promise<T> {
    if (queue.length >= 20) throw new TopicActionError(429,'Hay demasiados datasets en preparación. Reintentá en unos segundos.');
    await new Promise<void>(resolve=>{ const start=()=>{active++;resolve();}; if(active<2) start(); else queue.push(start); });
    try {
        return await new Promise<T>((resolve,reject)=>{
            const dev=import.meta.url.endsWith('.ts');
            const child=fork(new URL(dev ? `./${worker}-worker.ts` : `${import.meta.url.includes('/scripts/') ? '../' : './'}dataset-${worker}-worker.js`,import.meta.url),[],{execArgv:[...(dev ? process.execArgv : []), ...(worker === 'prepare' ? [`--max-old-space-size=${env.DATASET_PREPARE_MEMORY_MB}`] : [])],stdio:['ignore','ignore','ignore','ipc']});
            let done=false;
            const finish=(error?:Error,value?:T)=>{if(done)return;done=true;clearTimeout(timer);child.kill('SIGKILL');if(error)reject(error);else resolve(value!);};
            const timer=setTimeout(()=>finish(new TopicActionError(408,'La preparación o lectura del dataset superó el tiempo permitido.')),seconds*1000);
            child.once('error',error=>finish(error));
            child.once('exit',()=>finish(new Error('El proceso del dataset terminó inesperadamente.')));
            child.once('message',(result:any)=>finish(result.success ? undefined : new TopicActionError(400,result.error),result.value));
            child.send(job,error=>{if(error)finish(error);});
        });
    } finally {active--;queue.shift()?.();}
}

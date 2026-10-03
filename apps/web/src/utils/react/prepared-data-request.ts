import {backendUrl} from '@/lib/fetch';

export async function preparedDataRequest<T>(route:string,options?:RequestInit,onState?:(state:string)=>void):Promise<T>{
    const deadline=Date.now()+240000;
    let currentRoute=route,currentOptions=options;
    for(;;){
        options?.signal?.throwIfAborted();
        const response=await fetch(`${backendUrl}${currentRoute}`,{credentials:'include',...currentOptions});
        const result=await response.json();
        if(response.status!==202){
            if(!response.ok||!result.success)throw new Error(result.error??'No pudimos cargar los datos.');
            return result.value as T;
        }
        onState?.(result.state==='checking'?'Verificando actualización…':'Preparando dataset…');
        if(Date.now()>deadline)throw new Error('La preparación está tardando demasiado. Reintentá en unos momentos.');
        // Retry is an explicit user action, never repeated by polling.
        currentRoute=currentRoute.replace(/([?&])retry=true(&|$)/,'$1').replace(/[?&]$/,'');
        if(typeof currentOptions?.body==='string'){
            const body=JSON.parse(currentOptions.body);delete body.retry;
            currentOptions={...currentOptions,body:JSON.stringify(body)};
        }
        await new Promise<void>((resolve,reject)=>{
            const signal=options?.signal;
            const aborted=()=>{clearTimeout(timer);reject(signal?.reason);};
            const timer=setTimeout(()=>{signal?.removeEventListener('abort',aborted);resolve();},1000);
            signal?.addEventListener('abort',aborted,{once:true});
        });
    }
}

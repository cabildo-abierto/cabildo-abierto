import {TopicActionError} from '../topic-title-edits.js';
let active=0;
const waiting:(()=>void)[]=[];
export async function preparationSlot(){
    if(waiting.length>=20)throw new TopicActionError(429,'Hay demasiados datasets en preparación. Reintentá en unos segundos.');
    await new Promise<void>(resolve=>{const start=()=>{active++;resolve();};if(active<2)start();else waiting.push(start);});
    return ()=>{active--;waiting.shift()?.();};
}

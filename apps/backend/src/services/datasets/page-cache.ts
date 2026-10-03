const cache=new Map<string,{rows:string[][];bytes:number}>();
let bytes=0;
const limit=16*1024*1024;
export function cachedDatasetPage(key:string){
    const entry=cache.get(key);
    if(entry){cache.delete(key);cache.set(key,entry);}
    return entry?.rows;
}
export function cacheDatasetPage(key:string,rows:string[][]){
    const size=Buffer.byteLength(JSON.stringify(rows));
    if(size>limit)return;
    const previous=cache.get(key);if(previous)bytes-=previous.bytes;
    cache.delete(key);cache.set(key,{rows,bytes:size});bytes+=size;
    while(bytes>limit||cache.size>100){const oldest=cache.keys().next().value!;bytes-=cache.get(oldest)!.bytes;cache.delete(oldest);}
}

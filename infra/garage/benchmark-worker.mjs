import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';

const require=createRequire('/app/package.json');
const {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand,ListObjectsV2Command}=require('@aws-sdk/client-s3');
const {getSignedUrl}=require('@aws-sdk/s3-request-presigner');
const {DuckDBInstance}=require('@duckdb/node-api');
const manifest=JSON.parse(await readFile('/probe/manifest.json','utf8'));
const credentials=JSON.parse(await readFile('/credentials.json','utf8'));
const client=which=>new S3Client({region:'garage',endpoint:'http://127.0.0.1:3900',forcePathStyle:true,credentials:credentials[which],maxAttempts:1,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'});
const dev=client('dev'),prod=client('prod');
const results=[];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const emit=row=>{results.push(row);console.log(JSON.stringify(row))};
const stats=xs=>{const sorted=xs.toSorted((a,b)=>a-b);return {min:+sorted[0].toFixed(1),median:+sorted[Math.floor(sorted.length/2)].toFixed(1),max:+sorted.at(-1).toFixed(1)}};
const bucket='cabildoabierto-dev';
const key=s=>'benchmark/parquet/'+s.id+'.parquet';

async function verify(s){
 const response=await dev.send(new GetObjectCommand({Bucket:bucket,Key:key(s)}));
 const bytes=await response.Body.transformToByteArray();
 if(digest(bytes)!==s.sha256)throw Error('El hash del objeto no coincide');
}
function curl(url,range){
 return new Promise((resolve,reject)=>{
  const args=['-sS','--max-time','30','--retry','0','-o','/dev/null','-w','%{json}','--config','-'];if(range)args.push('--range',range);
  const child=spawn('curl',args,{stdio:['pipe','pipe','pipe']});let output='';child.stdout.on('data',c=>output+=c);child.stderr.resume();child.stdin.end('url = '+JSON.stringify(url)+'\n');
  child.on('error',()=>reject(Error('No se pudo ejecutar curl')));
  child.on('close',code=>{if(code)return reject(Error('Falló el pedido HTTP'));const r=JSON.parse(output);resolve({status:r.http_code,bytes:r.size_download,ttfb:r.time_starttransfer*1000,total:r.time_total*1000})});
 });
}
async function query(s,source,type){
 const start=performance.now();const instance=await DuckDBInstance.create(':memory:',{memory_limit:'256MB',threads:'1',max_temp_directory_size:'0B',autoinstall_known_extensions:'false',autoload_known_extensions:'false'});const c=await instance.connect();
 try{
  if(source.startsWith('http'))await c.run('LOAD httpfs; SET allow_persistent_secrets=false; SET prefetch_all_parquet_files=false; SET disable_parquet_prefetching=false; SET enable_external_file_cache=false');
  const quoted="'"+source.replaceAll("'","''")+"'";
  const offset=type==='page2'?100:0;
  const sql=type==='two_columns'?`SELECT sum(length(c0)),sum(length(c${s.columns.length-1})) FROM read_parquet(${quoted})`:`SELECT ${s.columns.map((_,i)=>'c'+i).join(',')} FROM read_parquet(${quoted}) WHERE __row>=${offset} AND __row<${offset+100} ORDER BY __row`;
  const rows=(await c.runAndReadAll(sql)).getRows();
  return {duration:performance.now()-start,hash:digest(JSON.stringify(rows,(_,v)=>typeof v==='bigint'?v.toString():v))};
 }finally{c.closeSync();instance.closeSync()}
}
async function denied(operation,cleanup){
 try{await operation();if(cleanup)await cleanup();throw Error('El aislamiento de ambientes falló')}
 catch(error){if(error.$metadata?.httpStatusCode!==403)throw error}
}
try{
 if(process.argv.includes('--verify')){
  for(const s of manifest.samples)await verify(s);
  const listed=await prod.send(new ListObjectsV2Command({Bucket:'cabildoabierto-prod',MaxKeys:1}));
  if(listed.KeyCount)throw Error('El bucket de producción dejó de estar vacío');
  const marker='benchmark/isolation-check.bin';
  await denied(()=>dev.send(new PutObjectCommand({Bucket:'cabildoabierto-prod',Key:marker,Body:Buffer.from('isolation')})),()=>prod.send(new DeleteObjectCommand({Bucket:'cabildoabierto-prod',Key:marker})));
  await denied(()=>prod.send(new PutObjectCommand({Bucket:bucket,Key:marker,Body:Buffer.from('isolation')})),()=>dev.send(new DeleteObjectCommand({Bucket:bucket,Key:marker})));
  emit({stage:'restart_verified',objects:manifest.samples.length,prodObjects:0,writeIsolation:true});
 }else{
  const listed=await prod.send(new ListObjectsV2Command({Bucket:'cabildoabierto-prod',MaxKeys:1}));
  if(listed.KeyCount)throw Error('El bucket de producción ya contiene objetos');
  for(const s of manifest.samples){
   const body=await readFile('/probe/'+s.id+'.parquet');
   if(digest(body)!==s.sha256)throw Error('El archivo de entrada cambió');
   await dev.send(new PutObjectCommand({Bucket:bucket,Key:key(s),Body:body,ContentType:'application/vnd.apache.parquet'}));await verify(s);
   s.routes.garage=await getSignedUrl(dev,new GetObjectCommand({Bucket:bucket,Key:key(s),ResponseContentDisposition:'inline',ResponseContentType:'application/vnd.apache.parquet'}),{expiresIn:3600});
  }
  await denied(()=>dev.send(new ListObjectsV2Command({Bucket:'cabildoabierto-prod'})));
  await denied(()=>prod.send(new ListObjectsV2Command({Bucket:bucket})));
  await denied(()=>prod.send(new GetObjectCommand({Bucket:bucket,Key:key(manifest.samples[0])})));
  emit({stage:'isolation_verified',prodObjects:0});
  for(const s of manifest.samples){
   const routes={...s.routes,localfile:'/probe/'+s.id+'.parquet'};
   for(const [route,url] of Object.entries(routes)){
    if(route==='localfile')continue;
    const check=await curl(url,'0-0');
    if(check.status!==206||check.bytes!==1){emit({stage:'excluded',route,rows:s.row_count,status:check.status});delete routes[route];if(route==='garage'||route==='s3')throw Error('Falló HTTP Range');continue}
    for(const mode of ['range','full']){
     const times=[];for(let i=0;i<5;i++){
      const response=await curl(url,mode==='range'?'0-0':undefined);
      if(response.status!==(mode==='range'?206:200)||response.bytes!==(mode==='range'?1:Number(s.size_bytes)))throw Error('Respuesta HTTP incorrecta');times.push(response);
     }
     emit({stage:'http',route,rows:s.row_count,size:Number(s.size_bytes),mode,n:5,total:stats(times.map(t=>t.total)),ttfb:stats(times.map(t=>t.ttfb))});
    }
   }
   for(const type of ['page','page2','two_columns']){
    const expected=(await query(s,routes.localfile,type)).hash;
    const times=Object.fromEntries(Object.keys(routes).map(r=>[r,[]]));
    for(let i=0;i<5;i++)for(const route of (i%2?Object.keys(routes).reverse():Object.keys(routes))){
     const answer=await query(s,routes[route],type);if(answer.hash!==expected)throw Error('Los resultados de las consultas difieren');times[route].push(answer.duration);
    }
    for(const [route,durations] of Object.entries(times))emit({stage:'duckdb',route,rows:s.row_count,queryType:type,n:5,total:stats(durations)});
   }
  }
  const s=manifest.samples.toSorted((a,b)=>b.row_count-a.row_count)[0];const expected=(await query(s,'/probe/'+s.id+'.parquet','two_columns')).hash;
  for(const writing of [false,true]){
   const times=[];
   for(let i=0;i<5;i++){
    const body=writing?randomBytes(20*1024*1024):null;
    const upload=writing?dev.send(new PutObjectCommand({Bucket:bucket,Key:'benchmark/concurrency.bin',Body:body})):Promise.resolve();
    const queries=Promise.all([query(s,s.routes.garage,'two_columns'),query(s,s.routes.garage,'two_columns')]);
    const [answers]=await Promise.all([queries,upload]);
    if(answers.some(a=>a.hash!==expected))throw Error('Resultados incorrectos bajo concurrencia');times.push(...answers.map(a=>a.duration));
   }
   emit({stage:'concurrency',route:'garage',queries:2,writing,writeBytes:writing?20*1024*1024:0,n:10,total:stats(times)});
  }
  await dev.send(new DeleteObjectCommand({Bucket:bucket,Key:'benchmark/concurrency.bin'}));
 }
}catch(error){
 emit({stage:'error',message:'La prueba falló; se omitieron URLs y credenciales.',code:error.name,httpStatus:error.$metadata?.httpStatusCode});process.exitCode=1;
}finally{
 dev.destroy();prod.destroy();await writeFile('/results/'+(process.argv.includes('--verify')?'restart':'benchmark')+'.json',JSON.stringify(results,null,2));
}

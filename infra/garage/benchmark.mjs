import {createRequire} from 'node:module';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';

const here=dirname(fileURLToPath(import.meta.url));
const backend=resolve(here,'../../apps/backend');
const require=createRequire(backend+'/package.json');
const dotenv=require('dotenv');
const pg=require('pg');
const {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand}=require('@aws-sdk/client-s3');
const {getSignedUrl}=require('@aws-sdk/s3-request-presigner');
const args=process.argv.slice(2);
function option(name,fallback){const index=args.indexOf(name);return index<0?fallback:args[index+1]}
if(args.includes('--help')){
 console.log('node infra/garage/benchmark.mjs [--host root@64.176.17.127] [--samples manifest.json] [--r2-public-base URL] [--output directorio]');process.exit(0);
}
for(let i=0;i<args.length;i+=2)if(!['--host','--samples','--r2-public-base','--output'].includes(args[i])||!args[i+1])throw Error('Argumentos inválidos; usá --help');
const host=option('--host','root@64.176.17.127');
if(!/^[a-zA-Z0-9_.@-]+$/.test(host)||host.startsWith('-'))throw Error('Host inválido');
const publicBase=option('--r2-public-base');
if(publicBase&&new URL(publicBase).protocol!=='https:')throw Error('La URL pública debe usar HTTPS');
const env=dotenv.parse(await readFile(backend+'/.env'));
if(env.CLOUDFLARE_BUCKET!=='cabildoabierto-dev'||!env.S3_ACCESS_KEY_ID||!env.S3_ACCESS_KEY_SECRET)throw Error('Configurá las credenciales S3 y CLOUDFLARE_BUCKET=cabildoabierto-dev');
const output=resolve(option('--output','/tmp/cabildo-garage-'+Date.now()));
const {mkdir}=await import('node:fs/promises');await mkdir(output,{mode:0o700,recursive:true});
const temp=await mkdtemp('/tmp/cabildo-garage-input-');
const remote='/opt/cabildo-garage-probe';
const storage='/mnt/cabildo-storage/garage';
const runId=randomUUID();
const s3=new S3Client({region:'sa-east-1',credentials:{accessKeyId:env.S3_ACCESS_KEY_ID,secretAccessKey:env.S3_ACCESS_KEY_SECRET},requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'});
let r2;
if(env.CLOUDFLARE_ACCESS_KEY_ID?.length===32&&env.CLOUDFLARE_SECRET_ACCESS_KEY){
 r2=new S3Client({region:'auto',endpoint:`https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:env.CLOUDFLARE_ACCESS_KEY_ID,secretAccessKey:env.CLOUDFLARE_SECRET_ACCESS_KEY},requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'});
}else console.log('R2 firmado excluido: las credenciales actuales no tienen el formato esperado.');
const uploaded=[];
let remotePrepared=false;
function execute(program,parameters,{capture=false}={}){
 return new Promise((accept,reject)=>{
  const child=spawn(program,parameters,{stdio:['ignore',capture?'pipe':'inherit','inherit']});let text='';if(capture)child.stdout.on('data',c=>text+=c);
  child.on('error',reject);child.on('close',code=>code===0?accept(text):reject(Error(program+' terminó con código '+code)));
 });
}
const ssh=(command,options)=>execute('ssh',['-o','BatchMode=yes','-o','ConnectTimeout=10',host,command],options);
const scp=(files,destination)=>execute('scp',['-q','-o','BatchMode=yes',...files,host+':'+destination]);
async function selectSamples(){
 const path=option('--samples');if(path)return JSON.parse(await readFile(path,'utf8'));
 const url=new URL(env.DIRECT_URL||env.DATABASE_URL);
 if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||!/dev/i.test(url.pathname))throw Error('La selección automática requiere la base local de dev');
 const db=new pg.Client({connectionString:url.toString(),connectionTimeoutMillis:5000});await db.connect();
 try{
  await db.query('BEGIN READ ONLY');await db.query("SET LOCAL statement_timeout='10s'");
  const selected=[];
  const rows=(await db.query(`SELECT DISTINCT ss.id,ss.bucket,ss.key,ss.row_count,ss.size_bytes,ss.columns FROM dataset_snapshot ss JOIN dataset_source s ON s.snapshot_id=ss.id WHERE ss.bucket=$1 AND ss.row_count>0 AND ss.size_bytes<=8388608`,[env.CLOUDFLARE_BUCKET])).rows;
  for(const target of [12,12957,157500]){
   const match=rows.filter(r=>!selected.some(s=>s.id===r.id)).sort((a,b)=>Math.abs(a.row_count-target)-Math.abs(b.row_count-target))[0];if(match)selected.push(match);
  }
  await db.query('ROLLBACK');return selected;
 }finally{await db.end()}
}
try{
 const samples=await selectSamples();if(samples.length!==3)throw Error('Se necesitan tres snapshots diferentes');
 for(const s of samples){
  if(!/^[0-9a-f-]{36}$/.test(s.id)||s.bucket!==env.CLOUDFLARE_BUCKET||!Array.isArray(s.columns)||!s.columns.length||!s.key.startsWith('datasets/')||Number(s.size_bytes)<=0||Number(s.size_bytes)>8388608||s.row_count<=0)throw Error('Manifest inválido');
  s.routes={};
  if(publicBase)s.routes.r2_public=new URL(s.key,publicBase.endsWith('/')?publicBase:publicBase+'/').toString();
  if(r2)s.routes.r2=await getSignedUrl(r2,new GetObjectCommand({Bucket:s.bucket,Key:s.key,ResponseContentDisposition:'inline',ResponseContentType:'application/vnd.apache.parquet'}),{expiresIn:3600});
  const source=s.routes.r2_public||s.routes.r2;if(!source)throw Error('Falta --r2-public-base o credenciales funcionales de R2');
  const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('No se pudo descargar una muestra de R2');
  const body=Buffer.from(await response.arrayBuffer());if(body.length!==Number(s.size_bytes))throw Error('Tamaño inesperado de la muestra');
  s.sha256=createHash('sha256').update(body).digest('hex');await writeFile(temp+'/'+s.id+'.parquet',body,{mode:0o600});
  const key='benchmark/garage-comparison/'+runId+'/'+s.id+'.parquet';
  await s3.send(new PutObjectCommand({Bucket:env.CLOUDFLARE_BUCKET,Key:key,Body:body,ContentType:'application/vnd.apache.parquet'}));uploaded.push(key);
  s.routes.s3=await getSignedUrl(s3,new GetObjectCommand({Bucket:env.CLOUDFLARE_BUCKET,Key:key,ResponseContentDisposition:'inline',ResponseContentType:'application/vnd.apache.parquet'}),{expiresIn:3600});
 }
 await writeFile(temp+'/manifest.json',JSON.stringify({samples}),{mode:0o600});
 await writeFile(output+'/samples.json',JSON.stringify(samples.map(({routes,...sample})=>sample),null,2));
 await ssh('umask 077; mkdir -p '+remote);
 await scp(['compose.yml','garage.toml.template','ops.sh','run-benchmark.sh','monitor.py','report.py','benchmark-worker.mjs'].map(p=>here+'/'+p),remote+'/');
 remotePrepared=true;
 await ssh('bash '+remote+'/ops.sh setup');
 await scp([temp+'/manifest.json',...samples.map(s=>temp+'/'+s.id+'.parquet')],storage+'/probe/');
 try{await ssh('bash '+remote+'/run-benchmark.sh')}finally{
  const latest=(await ssh('find '+storage+'/results -mindepth 1 -maxdepth 1 -type d | sort | tail -1',{capture:true})).trim();
  if(/^\/mnt\/cabildo-storage\/garage\/results\/\d{8}T\d{6}Z$/.test(latest)){
   await ssh('python3 '+remote+'/report.py '+latest);
   await execute('scp',['-q','-r','-o','BatchMode=yes',host+':'+latest,output+'/']);
  }
  await ssh('bash '+remote+'/ops.sh stop; rm -f '+storage+'/probe/manifest.json');
 }
 console.log('Resultados locales: '+output);
}catch(error){
 console.error('La prueba no se completó. '+(error.$metadata?'Error de S3: '+error.name+' HTTP '+error.$metadata.httpStatusCode:String(error.message).replace(/https?:\/\/\S+/g,'[URL]')));process.exitCode=1;
}finally{
 if(remotePrepared)try{await ssh('bash '+remote+'/ops.sh stop; rm -f '+storage+'/probe/manifest.json')}catch{console.error('No se pudo confirmar la detención de Garage.');process.exitCode=1}
 let cleanupFailed=false;
 for(const key of uploaded)try{await s3.send(new DeleteObjectCommand({Bucket:env.CLOUDFLARE_BUCKET,Key:key}))}catch{cleanupFailed=true}
 if(cleanupFailed){console.error('No se pudieron borrar todas las copias temporales de S3.');await writeFile(output+'/s3-cleanup-pending.json',JSON.stringify({bucket:env.CLOUDFLARE_BUCKET,keys:uploaded},null,2));process.exitCode=1}
 s3.destroy();r2?.destroy();await rm(temp,{recursive:true,force:true});
}

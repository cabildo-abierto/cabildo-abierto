import {setupKysely} from '#/setup.js';
import {S3Storage} from '#/services/storage/storage.js';
import {waitSnapshot} from '#/services/datasets/snapshots.js';

const database=setupKysely();
try {
    const args=process.argv.slice(2);const limitIndex=args.indexOf('--limit');
    const limit=limitIndex<0?Number.MAX_SAFE_INTEGER:Number(args[limitIndex+1]);
    if(!Number.isSafeInteger(limit)||limit<1)throw new Error('Usá --limit con un entero positivo.');
    const storage=new S3Storage();
    if(args.includes('--cleanup')){
        const retired=await database.selectFrom('dataset_snapshot').selectAll().where('retired_at','<',new Date(Date.now()-86400000)).limit(limit).execute();
        for(const snapshot of retired){await storage.remove(snapshot);await database.deleteFrom('dataset_snapshot').where('id','=',snapshot.id).execute();}
        console.log(`${retired.length} snapshots retirados eliminados.`);
    }else{
        const sources=await database.selectFrom('dataset').innerJoin('dataset_source','dataset_source.id','dataset.source_id')
            .select(['dataset_source.id','dataset_source.snapshot_id']).distinct().orderBy('dataset_source.id').execute();
        let count=0;
        for(const source of sources){
            if(source.snapshot_id)continue;
            if(count>=limit)break;count++;
            try{const snapshot=await waitSnapshot(database,source.id,storage);console.log(`Preparado ${snapshot.id}: ${snapshot.row_count} filas.`);}
            catch(error){console.error(error instanceof Error?error.message:'No se pudo preparar el dataset.');process.exitCode=1;}
        }
        console.log(`${count} fuentes procesadas. Volvé a ejecutar para continuar con las pendientes.`);
    }
}finally{await database.destroy();}

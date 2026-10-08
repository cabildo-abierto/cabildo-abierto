import {ensureDatasetSource} from '#/services/datasets/sources.js';
import {loadDataset} from '#/services/datasets/load.js';
import express from 'express';
import {mkdtemp, open, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {datasetSourceOptions, validDatasetUrl} from '@cabildo-abierto/utils';
import type {AppContext} from '#/setup.js';
import {requireSession, requiredUser} from '#/auth/middleware.js';
import {TopicActionError} from '#/services/topic-title-edits.js';
import {S3Storage, type ObjectStorage} from '#/services/storage/storage.js';
import {storeFile, removeUnattachedFile} from '#/services/storage/files.js';
import {datasetJob, warmDatasetPageWorker} from '#/services/datasets/process.js';
import {env} from '#/lib/env.js';
import {datasetLimits} from '#/services/datasets/csv.js';
import {readySnapshot, snapshotPage, DatasetPending, prepareLocalCSV} from '#/services/datasets/snapshots.js';
import {publishSnapshot} from '#/services/datasets/publish.js';
import {requireDatasetAccess} from '#/services/datasets/access.js';
import {requireDatasetFileAccess} from '#/services/datasets/access.js';

export function datasetRoutes(ctx: AppContext, createStorage: () => ObjectStorage = () => new S3Storage()) {
    warmDatasetPageWorker();
    const router = express.Router();
    router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next();});
    let storage: ObjectStorage | undefined;
    const getStorage = () => storage ??= createStorage();
    const fail = (res: express.Response, error: unknown) => {
        if (error instanceof DatasetPending) return res.status(202).json({success: true, pending: true, state: error.state});
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, 'dataset request failed');
        return res.status(500).json({success: false, error: 'No pudimos cargar el conjunto de datos. Podés reintentar.'});
    };
    router.post('/topics/:id/datasets/upload', requireSession(ctx), async (req, res) => {
        let directory: string | undefined; let fileId: string | undefined;
        try {
            const name = typeof req.query.name === 'string' ? req.query.name.normalize('NFC') : '';
            if (!name || name.length > 255 || /[\x00-\x1f/\\]/.test(name) || !/\.(csv|json)$/i.test(name)) throw new TopicActionError(400, 'Elegí un archivo CSV o JSON.');
            const format = name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
            if (!req.is('application/octet-stream')) throw new TopicActionError(400, 'Enviá el archivo como contenido binario.');
            const topic = await ctx.kysely.selectFrom('topic').select('id').where('id', '=', String(req.params.id)).executeTakeFirst();
            if (!topic) throw new TopicActionError(404, 'No encontramos ese tema.');
            const max = datasetLimits().bytes;
            if (Number(req.headers['content-length']) > max) throw new TopicActionError(413, 'El archivo supera el tamaño permitido.');
            directory = await mkdtemp(join(tmpdir(), 'ca-csv-'));
            const path = join(directory, `upload.${format}`);
            const output = await open(path,'wx'); let length = 0;
            try {
                for await (const chunk of req) {
                    length += chunk.length;
                    if (length > max) throw new TopicActionError(413,'El archivo supera el tamaño permitido.');
                    await output.writeFile(chunk);
                }
            } finally { await output.close(); }
            const parquetPath=join(directory,'data.parquet');
            const metadata=format==='csv'?await prepareLocalCSV(path,parquetPath,directory):null;
            if(format==='json') await datasetJob('prepare',{path,validateOnly:true},env.DATASET_PREPARE_SECONDS);
            const file = await storeFile(ctx, getStorage(), path, name, format==='json'?'application/json':'text/csv', requiredUser(req).id); fileId = file.id;
            await ctx.kysely.updateTable('file').set({format, preview_status: 'ready'}).where('id','=', file.id).execute();
            if(metadata){
                const sourceId=await ensureDatasetSource(ctx.kysely,{file_id:fileId,source_url:null,source_format:'csv',jq_filter:null});
                await publishSnapshot(ctx.kysely,getStorage(),sourceId,parquetPath,metadata,file.sha256,{etag:null,lastModified:null});
            }
            res.status(201).json({success: true, value: {fileId, fileName: name, sourceUrl: null, sourceFormat: format, jqFilter: null}});
            fileId = undefined;
        } catch(error) {
            if (fileId) await removeUnattachedFile(ctx, getStorage(), fileId).catch(e => ctx.logger.pino.error({error: e}, 'Dataset upload cleanup failed'));
            return fail(res, error);
        } finally { if (directory) await rm(directory, {recursive: true, force: true}); }
    });
    router.post('/topics/:id/datasets/preview', requireSession(ctx), async (req, res) => {
        try {
            const topic = await ctx.kysely.selectFrom('topic').select('id').where('id','=',String(req.params.id)).executeTakeFirst();
            if (!topic) throw new TopicActionError(404,'No encontramos ese tema.');
            const body = req.body ?? {};
            const options = datasetSourceOptions(body);
            if (!options) throw new TopicActionError(400, 'El formato o la transformación del dataset no son válidos.');
            let fileName: string | null = null;
            const hasFile = typeof body.fileId === 'string' && !!body.fileId;
            const hasUrl = typeof body.sourceUrl === 'string' && !!body.sourceUrl;
            if (hasFile === hasUrl) throw new TopicActionError(400,'Elegí un archivo o una URL.');
            if (hasFile) {
                const file = await requireDatasetFileAccess(ctx.kysely, body.fileId, requiredUser(req).id, options.sourceFormat);
                fileName = file.name;
            } else if (!validDatasetUrl(body.sourceUrl)) throw new TopicActionError(400,'La URL no es válida.');
            const sourceId=await ensureDatasetSource(ctx.kysely,{file_id:hasFile?body.fileId:null,source_url:hasUrl?body.sourceUrl:null,source_format:options.sourceFormat,jq_filter:options.jqFilter});
            const snapshot = await readySnapshot(ctx.kysely,sourceId,getStorage(),{snapshotId:body.snapshotId,retry:body.retry===true});
            const page=body.page??0;
            res.json({success:true,value:{...options,columns:snapshot.columns,csvOptions:snapshot.csv_options,rows:await snapshotPage(snapshot,getStorage(),page),rowCount:snapshot.row_count,snapshotId:snapshot.id,page,fileId:hasFile?body.fileId:null,sourceUrl:hasUrl?body.sourceUrl:null,fileName}});
        } catch(error) { return fail(res,error); }
    });
    router.get('/dataset-versions/:id', async (req,res) => {
        try {
            const value = await loadDataset(ctx.kysely, String(req.params.id), getStorage, {page:req.query.page===undefined?0:Number(req.query.page),snapshotId:typeof req.query.snapshotId==='string'?req.query.snapshotId:undefined,retry:req.query.retry==='true'});
            res.set('Cache-Control','no-store').json({success: true, value});
        } catch(error) { return fail(res,error); }
    });
    router.get('/dataset-versions/:id/metadata',async(req,res)=>{
        try {
            const dataset=await requireDatasetAccess(ctx.kysely,String(req.params.id));
            const source=await ctx.kysely.selectFrom('dataset_source').innerJoin('dataset_snapshot','dataset_snapshot.id','dataset_source.snapshot_id')
                .select(['row_count','checked_at']).where('dataset_source.id','=',dataset.source_id).executeTakeFirst();
            res.json({success:true,value:{title:dataset.title,description:dataset.description,rowCount:source?.row_count,checkedAt:source?.checked_at}});
        } catch(error){return fail(res,error);}
    });
    return router;
}

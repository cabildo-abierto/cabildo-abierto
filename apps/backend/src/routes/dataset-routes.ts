import {requireTopicAccess, topicAccessContext} from '#/services/topic-access.js';
import type {DatasetSourceDetails} from '@cabildo-abierto/api';
import {listDatasets} from '#/services/datasets/list.js';
import {datasetSourceBlocks} from '#/services/visualizations/source-blocks.js';
import {parseDatasetBlock} from '@cabildo-abierto/utils';
import type {PendingErrorResponder} from '../openapi/handler.js';
import {createApiRouter} from '../openapi/router.js';
import {loadTablePage} from '#/services/tables/load.js';
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
import {readySnapshot, snapshotPage, snapshotCSVOptions, DatasetPending, prepareLocalCSV} from '#/services/datasets/snapshots.js';
import {datasetUpdate} from '#/services/datasets/update.js';
import {publishSnapshot} from '#/services/datasets/publish.js';
import {requireDatasetAccess} from '#/services/datasets/access.js';
import {requireDatasetFileAccess} from '#/services/datasets/access.js';

export function datasetRoutes(ctx: AppContext, createStorage: () => ObjectStorage = () => new S3Storage()): express.Router {
    warmDatasetPageWorker();
    const router = express.Router();
    const api = createApiRouter(router);
    router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next();});
    let storage: ObjectStorage | undefined;
    const getStorage = () => storage ??= createStorage();
    const fail = (res: PendingErrorResponder, error: unknown) => {
        if (error instanceof DatasetPending) return res.status(202).json({success: true, pending: true, state: error.state});
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, 'dataset request failed');
        return res.status(500).json({success: false, error: 'No pudimos cargar el conjunto de datos. Podés reintentar.'});
    };
    api.get('/datasets', async (req, res) => {
        try {
            const value = await ctx.kysely.transaction().setIsolationLevel('repeatable read').execute(trx => listDatasets(trx, req.query));
            return res.json({success: true, value});
        } catch (error) { return fail(res, error); }
    });
    api.post('/datasets/upload', requireSession(ctx), async (req, res) => {
        let directory: string | undefined; let fileId: string | undefined;
        try {
            const name = typeof req.query.name === 'string' ? req.query.name.normalize('NFC') : '';
            if (!name || name.length > 255 || /[\x00-\x1f/\\]/.test(name) || !/\.(csv|json)$/i.test(name)) throw new TopicActionError(400, 'Elegí un archivo CSV o JSON.');
            const format = name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
            if (!req.is('application/octet-stream')) throw new TopicActionError(400, 'Enviá el archivo como contenido binario.');
            const max = datasetLimits(format).bytes;
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
            if(format==='json') await datasetJob('prepare',{path,format,validateOnly:true},env.DATASET_PREPARE_SECONDS);
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
    api.post('/datasets/preview', requireSession(ctx), async (req, res) => {
        try {
            const body = req.body ?? {};
            const options = datasetSourceOptions(body);
            if (!options) throw new TopicActionError(400, 'El formato o la transformación del dataset no son válidos.');
            let fileName: string | null = null;
            const fileId = typeof body.fileId === 'string' && body.fileId ? body.fileId : null;
            const hasFile = fileId !== null;
            const sourceUrl = typeof body.sourceUrl === 'string' && body.sourceUrl ? body.sourceUrl : null;
            const hasUrl = sourceUrl !== null;
            if (hasFile === hasUrl) throw new TopicActionError(400,'Elegí un archivo o una URL.');
            if (hasFile) {
                const file = await requireDatasetFileAccess(ctx.kysely, fileId, requiredUser(req).id, options.sourceFormat);
                fileName = file.name;
            } else if (!sourceUrl || !validDatasetUrl(sourceUrl)) throw new TopicActionError(400,'La URL no es válida.');
            const sourceId=await ensureDatasetSource(ctx.kysely,{file_id:fileId,source_url:sourceUrl,source_format:options.sourceFormat,jq_filter:options.jqFilter});
            const snapshot = await readySnapshot(ctx.kysely,sourceId,getStorage(),{snapshotId:body.snapshotId,retry:body.retry===true});
            const page=body.page??0;
            res.json({success:true,value:{...options,columns:snapshot.columns,csvOptions:snapshotCSVOptions(snapshot),rows:await snapshotPage(snapshot,getStorage(),page),rowCount:snapshot.row_count,snapshotId:snapshot.id,page,fileId:fileId,sourceUrl:sourceUrl,fileName}});
        } catch(error) { return fail(res,error); }
    });
    api.post('/datasets/versions/:id/table-page', async (req, res) => {
        try { res.json({success: true, value: await loadTablePage(ctx.kysely, String(req.params.id), req.body ?? {}, getStorage())}); }
        catch (error) { return fail(res, error); }
    });
    api.get('/datasets/versions/:id', async (req,res) => {
        try {
            const value = await loadDataset(ctx.kysely, String(req.params.id), getStorage, {page:req.query.page===undefined?0:Number(req.query.page),snapshotId:typeof req.query.snapshotId==='string'?req.query.snapshotId:undefined,retry:req.query.retry==='true'});
            res.set('Cache-Control','no-store').json({success: true, value});
        } catch(error) { return fail(res,error); }
    });
    api.get('/datasets/versions/:id/metadata',async(req,res)=>{
        try {
            const dataset=await requireDatasetAccess(ctx.kysely,String(req.params.id));
            const source=await ctx.kysely.selectFrom('dataset_source').innerJoin('dataset_snapshot','dataset_snapshot.id','dataset_source.snapshot_id')
                .select(['row_count','checked_at']).where('dataset_source.id','=',dataset.source_id).executeTakeFirst();
            res.json({success:true,value:{title:dataset.title,description:dataset.description,rowCount:source?.row_count,checkedAt:source?.checked_at?.toISOString()}});
        } catch(error){return fail(res,error);}
    });
    api.get('/datasets/versions/:id/update',async(req,res)=>{
        try {
            const dataset=await requireDatasetAccess(ctx.kysely,String(req.params.id));
            res.json({success:true,value:await datasetUpdate(ctx.kysely,dataset.source_id)});
        } catch(error){return fail(res,error);}
    });
    api.get('/datasets/:topicId/:blockNumber', async (req, res) => {
        try {
            const sourceTopic = await requireTopicAccess(ctx.kysely, req.params.topicId);
            topicAccessContext.getStore()!.topicId = sourceTopic.id;
            const {sources: [{topic,block}]} = await datasetSourceBlocks(ctx.kysely,[{topicId: String(req.params.topicId),blockNumber: String(req.params.blockNumber)}]);
            const topicId = topic.id;
            const data = parseDatasetBlock(block.content)!;
            const value: DatasetSourceDetails = {topic, topicId, block, blockNumber: block.blockNumber, versionId: block.id, title: data.title, rowCount: data.rowCount, columns: data.columns};
            res.set('Cache-Control', 'no-store').json({success: true, value});
        } catch (error) { fail(res,error); }
    });
    return router;
}

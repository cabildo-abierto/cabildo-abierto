import {loadDataset} from '#/services/datasets/load.js';
import express from 'express';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {validDatasetUrl} from '@cabildo-abierto/utils';
import type {AppContext} from '#/setup.js';
import {requireSession, requiredUser} from '#/auth/middleware.js';
import {TopicActionError} from '#/services/topic-title-edits.js';
import {R2Storage, type ObjectStorage} from '#/services/storage/storage.js';
import {storeFile, removeUnattachedFile} from '#/services/storage/files.js';
import {datasetLimits, parseCSV} from '#/services/datasets/csv.js';
import {downloadCSV} from '#/services/datasets/download.js';
import {requireDatasetFileAccess} from '#/services/datasets/access.js';

export function datasetRoutes(ctx: AppContext, createStorage: () => ObjectStorage = () => new R2Storage()) {
    const router = express.Router();
    let storage: ObjectStorage | undefined;
    const getStorage = () => storage ??= createStorage();
    const fail = (res: express.Response, error: unknown) => {
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, 'dataset request failed');
        return res.status(500).json({success: false, error: 'No pudimos cargar el conjunto de datos. Podés reintentar.'});
    };
    router.post('/topics/:id/datasets/upload', requireSession(ctx), async (req, res) => {
        let directory: string | undefined; let fileId: string | undefined;
        try {
            const name = typeof req.query.name === 'string' ? req.query.name.normalize('NFC') : '';
            if (!name || name.length > 255 || /[\x00-\x1f/\\]/.test(name) || !name.toLowerCase().endsWith('.csv')) throw new TopicActionError(400, 'Elegí un archivo CSV.');
            if (!req.is('application/octet-stream')) throw new TopicActionError(400, 'Enviá el CSV como contenido binario.');
            const topic = await ctx.kysely.selectFrom('topic').select('id').where('id', '=', String(req.params.id)).executeTakeFirst();
            if (!topic) throw new TopicActionError(404, 'No encontramos ese tema.');
            const max = datasetLimits().bytes;
            if (Number(req.headers['content-length']) > max) throw new TopicActionError(413, 'El CSV supera el tamaño permitido.');
            const chunks: Buffer[] = []; let length = 0;
            for await (const chunk of req) {
                length += chunk.length;
                if (length > max) throw new TopicActionError(413, 'El CSV supera el tamaño permitido.');
                chunks.push(Buffer.from(chunk));
            }
            const data = Buffer.concat(chunks);
            const parsed = parseCSV(data);
            directory = await mkdtemp(join(tmpdir(), 'ca-csv-'));
            const path = join(directory, 'upload.csv'); await writeFile(path, data);
            const file = await storeFile(ctx, getStorage(), path, name, 'text/csv', requiredUser(req).id); fileId = file.id;
            await ctx.kysely.updateTable('file').set({format: 'csv', preview_status: 'ready'}).where('id','=', file.id).execute();
            res.status(201).json({success: true, value: {...parsed, fileId, fileName: name, sourceUrl: null}});
            fileId = undefined;
        } catch(error) {
            if (fileId) await removeUnattachedFile(ctx, getStorage(), fileId).catch(e => ctx.logger.pino.error({error: e}, 'CSV cleanup failed'));
            return fail(res, error);
        } finally { if (directory) await rm(directory, {recursive: true, force: true}); }
    });
    router.post('/topics/:id/datasets/preview', requireSession(ctx), async (req, res) => {
        try {
            const topic = await ctx.kysely.selectFrom('topic').select('id').where('id','=',String(req.params.id)).executeTakeFirst();
            if (!topic) throw new TopicActionError(404,'No encontramos ese tema.');
            const body = req.body ?? {};
            let data: Uint8Array; let fileName: string | null = null;
            const hasFile = typeof body.fileId === 'string' && !!body.fileId;
            const hasUrl = typeof body.sourceUrl === 'string' && !!body.sourceUrl;
            if (hasFile === hasUrl) throw new TopicActionError(400,'Elegí un archivo o una URL.');
            if (hasFile) {
                const file = await requireDatasetFileAccess(ctx.kysely, body.fileId, requiredUser(req).id);
                data = await getStorage().read(file); fileName = file.name;
            } else {
                if (!validDatasetUrl(body.sourceUrl)) throw new TopicActionError(400,'La URL no es válida.');
                data = await downloadCSV(body.sourceUrl);
            }
            res.json({success: true, value: {...parseCSV(data), fileId: hasFile ? body.fileId : null, sourceUrl: hasUrl ? body.sourceUrl : null, fileName}});
        } catch(error) { return fail(res,error); }
    });
    router.get('/dataset-versions/:id', async (req,res) => {
        try {
            const value = await loadDataset(ctx.kysely, String(req.params.id), getStorage);
            res.set('Cache-Control','no-store').json({success: true, value});
        } catch(error) { return fail(res,error); }
    });
    return router;
}

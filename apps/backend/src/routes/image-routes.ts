import express from 'express';
import type {AppContext} from '#/setup.js';
import {currentUser, requiredUser, requireSession, withSession} from '#/auth/middleware.js';
import {TopicActionError} from '#/services/topic-title-edits.js';
import {S3Storage, type ObjectStorage} from '#/services/storage/storage.js';
import {requireFileAccess} from '#/services/storage/access.js';
import {downloadRemoteFile} from '#/services/storage/download.js';
import {storeImage, IMAGE_MAX_BYTES} from '#/services/images/upload.js';
export function imageRoutes(ctx: AppContext, createStorage: () => ObjectStorage = () => new S3Storage()) {
    const router = express.Router();
    let storage: ObjectStorage | undefined;
    const getStorage = () => storage ??= createStorage();
    const fail = (res: express.Response, error: unknown) => {
        if (error instanceof TopicActionError) return res.status(error.status).json({success:false,error:error.message});
        ctx.logger.pino.error({error},'image request failed');
        return res.status(500).json({success:false,error:'No pudimos cargar la imagen. Podés reintentar.'});
    };
    for (const method of ['upload','import'] as const) router.post('/topics/:id/images/'+method,requireSession(ctx),async(req,res) => {
        try {
            const topic = await ctx.kysely.selectFrom('topic').select('id').where('id','=',String(req.params.id)).executeTakeFirst();
            if (!topic) throw new TopicActionError(404,'No encontramos ese tema.');
            let data: Buffer;
            if (method === 'import') {
                if (typeof req.body?.url !== 'string') throw new TopicActionError(400,'Ingresá la URL de una imagen.');
                data = await downloadRemoteFile(req.body.url,{maxBytes:IMAGE_MAX_BYTES,accept:'image/png, image/jpeg, image/webp',label:'la imagen'});
            } else {
                if (!req.is('application/octet-stream')) throw new TopicActionError(400,'Enviá la imagen como contenido binario.');
                if (Number(req.headers['content-length']) > IMAGE_MAX_BYTES) throw new TopicActionError(413,'La imagen supera los 20 MiB.');
                const chunks: Buffer[] = []; let size=0;
                for await (const chunk of req) { size+=chunk.length; if (size > IMAGE_MAX_BYTES) throw new TopicActionError(413,'La imagen supera los 20 MiB.'); chunks.push(Buffer.from(chunk)); }
                data = Buffer.concat(chunks);
            }
            return res.status(201).json({success:true,value:await storeImage(ctx,getStorage(),data,requiredUser(req).id)});
        } catch(error) { return fail(res,error); }
    });
    router.get('/images/files/:fileId',withSession(ctx),async(req,res) => {
        try {
            const file = await requireFileAccess(ctx.kysely,String(req.params.fileId),currentUser(req)?.id,'image');
            const asset = await ctx.kysely.selectFrom('image_asset').select(['width','height']).where('file_id','=',file.id).executeTakeFirstOrThrow();
            const url = await getStorage().signedUrl(file,'inline',file.mime,'public');
            return res.set('Cache-Control','no-store').json({success:true,value:{fileId:file.id,fileName:file.name,...asset,url,expiresAt:Date.now()+900000}});
        } catch(error) { return fail(res,error); }
    });
    return router;
}

import {randomUUID} from "node:crypto";
import {createWriteStream} from "node:fs";
import {mkdtemp, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {Transform} from "node:stream";
import {pipeline} from "node:stream/promises";
import type {Request} from "express";
import type {AppContext} from "#/setup.js";
import {TopicActionError} from "#/services/topic-title-edits.js";
import type {ObjectStorage} from "#/services/storage/storage.js";
import {storeFile, removeUnattachedFile} from "#/services/storage/files.js";
import {documentFileType, validateDocumentFile} from "./validation.js";

export async function uploadDocument(ctx: AppContext, storage: ObjectStorage, req: Request, topicId: string, authorId: string) {
    const name = typeof req.query.name === 'string' ? req.query.name.normalize('NFC') : '';
    if (!name || name.length > 255 || /[\x00-\x1f/\\]/.test(name)) throw new TopicActionError(400, 'El nombre de archivo no es válido.');
    if (!req.is('application/octet-stream')) throw new TopicActionError(400, 'Enviá el archivo como contenido binario.');
    const type = documentFileType(name);
    if (Number(req.headers['content-length']) > type.maxBytes) throw new TopicActionError(413, 'El archivo supera el tamaño permitido.');
    const topic = await ctx.kysely.selectFrom('topic').select('id').where('id', '=', topicId).executeTakeFirst();
    if (!topic) throw new TopicActionError(404, 'No encontramos ese tema.');
    const directory = await mkdtemp(join(tmpdir(), 'ca-upload-'));
    let fileId: string | undefined;
    let committed = false;
    try {
        const path = join(directory, 'upload');
        let size = 0;
        const limiter = new Transform({transform(chunk, _encoding, callback) {
            size += chunk.length;
            callback(size > type.maxBytes ? new TopicActionError(413, 'El archivo supera el tamaño permitido.') : null, chunk);
        }});
        await pipeline(req, limiter, createWriteStream(path));
        const validated = await validateDocumentFile(path, name);
        const file = await storeFile(ctx, storage, path, name, type.mime, authorId);
        fileId = file.id;
        await ctx.kysely.transaction().execute(async trx => {
            await trx.updateTable('file').set({format: type.format, preview_status: type.format === 'office' ? 'pending' : 'ready'})
                .where('id', '=', file.id).execute();
            if (validated.ca) {
                const blocks = validated.ca.blocks.map((block, position) => ({id: randomUUID(), file_id: file.id, position,
                    type_id: block.typeId, content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}));
                for (let index = 0; index < blocks.length; index += 500) await trx.insertInto('document_block').values(blocks.slice(index, index + 500)).execute();
            }
        });
        committed = true;
        return {id: file.id, format: type.format, fileName: name};
    } finally {
        if (fileId && !committed) await removeUnattachedFile(ctx, storage, fileId).catch(error => ctx.logger.pino.error({error, fileId}, 'upload cleanup failed'));
        await rm(directory, {recursive: true, force: true});
    }
}

import sharp from 'sharp';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import type {AppContext} from '#/setup.js';
import type {ObjectStorage} from '../storage/storage.js';
import {storeFile, removeUnattachedFile} from '../storage/files.js';
import {TopicActionError} from '../topic-title-edits.js';
export const IMAGE_MAX_BYTES = 20 * 1024 * 1024;
export async function storeImage(ctx: AppContext, storage: ObjectStorage, data: Buffer, authorId: string) {
    if (!data.length || data.length > IMAGE_MAX_BYTES) throw new TopicActionError(413, 'La imagen está vacía o supera los 20 MiB.');
    const png = data.subarray(0,8).toString('hex') === '89504e470d0a1a0a';
    const jpeg = data[0] === 255 && data[1] === 216 && data[2] === 255;
    const webp = data.subarray(0,4).toString() === 'RIFF' && data.subarray(8,12).toString() === 'WEBP';
    if (!png && !jpeg && !webp) throw new TopicActionError(400, 'Elegí una imagen PNG, JPEG o WebP estática.');
    let width: number, height: number, buffer: Buffer, format: string;
    try {
        if (png) {
            for (let offset = 8; offset + 12 <= data.length;) {
                const length = data.readUInt32BE(offset);
                if (data.toString('ascii', offset + 4, offset + 8) === 'acTL') throw new Error('animated');
                offset += length + 12;
            }
        }
        const image = sharp(data, {limitInputPixels: 40_000_000, failOn: 'warning'});
        const metadata = await image.metadata();
        if ((metadata.pages ?? 1) !== 1) throw new Error('animated');
        format = png ? 'png' : jpeg ? 'jpeg' : 'webp';
        const output = await image.autoOrient().toFormat(format as 'png' | 'jpeg' | 'webp').toBuffer({resolveWithObject: true});
        buffer = output.data; width = output.info.width; height = output.info.height;
    } catch {
        throw new TopicActionError(400, 'No pudimos leer esa imagen. Usá PNG, JPEG o WebP estático de hasta 40 megapíxeles.');
    }
    if (buffer.length > IMAGE_MAX_BYTES) throw new TopicActionError(413, 'La imagen procesada supera los 20 MiB.');
    const directory = await mkdtemp(join(tmpdir(), 'ca-image-'));
    let fileId: string | undefined;
    try {
        const path = join(directory, 'image.'+format); await writeFile(path, buffer);
        const file = await storeFile(ctx, storage, path, 'imagen.'+format, 'image/'+format, authorId); fileId=file.id;
        await ctx.kysely.transaction().execute(async trx => {
            await trx.updateTable('file').set({format:'image',preview_status:'ready'}).where('id','=',file.id).execute();
            await trx.insertInto('image_asset').values({file_id:file.id,width,height}).execute();
        });
        return {fileId:file.id,fileName:file.name,width,height};
    } catch(error) {
        if (fileId) await removeUnattachedFile(ctx, storage, fileId).catch(cleanupError => ctx.logger.pino.error({cleanupError},'image cleanup failed'));
        throw error;
    } finally { await rm(directory,{recursive:true,force:true}); }
}

import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, basename} from 'node:path';
import type {AppContext} from '#/setup.js';
import {env} from '#/lib/env.js';
import {TopicActionError} from '../topic-title-edits.js';
import {openRemoteFile} from '../storage/download.js';
import type {ObjectStorage} from '../storage/storage.js';
import {documentFileType, documentExtensionForMime} from './validation.js';
import {saveDocumentPath} from './upload.js';
import {decodeDocumentHtml, htmlPlainText} from './html.js';

export async function importDocument(ctx: AppContext, storage: ObjectStorage, topicId: string, authorId: string, url: string) {
    if (!await ctx.kysely.selectFrom('topic').select('id').where('id', '=', topicId).executeTakeFirst()) throw new TopicActionError(404, 'No encontramos ese tema.');
    const {response, finalUrl} = await openRemoteFile(url, {maxBytes: Math.max(env.DOCUMENT_MAX_MB, env.DOCUMENT_TEXT_MAX_MB) * 1024 * 1024, accept: '*/*', userAgent: 'Mozilla/5.0 (compatible; CabildoAbierto/1.0)', label: 'el documento'});
    if (!response) throw new TopicActionError(400, 'No pudimos descargar el documento.');
    let directory: string | undefined;
    try {
        const contentType = response.headers['content-type'] ?? '';
        const mime = contentType.split(';')[0].trim().toLowerCase();
        const html = mime === 'text/html' || mime === 'application/xhtml+xml';
        const disposition = response.headers['content-disposition'] ?? '';
        const encodedName = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
        const headerName = encodedName ? decodeURIComponent(encodedName) : /filename="([^"]+)"|filename=([^;]+)/i.exec(disposition)?.slice(1).find(Boolean);
        let name = basename(headerName?.trim() || decodeURIComponent(new URL(finalUrl ?? url).pathname)) || 'documento';
        name = name.replace(/[\x00-\x1f/\\]/g, '_').slice(0, 230);
        if (html) name = name.replace(/\.[^.]+$/, '') + '.html';
        else {
            try { documentFileType(name); }
            catch {
                const extension = documentExtensionForMime(mime);
                if (!extension) throw new TopicActionError(400, 'La URL no devuelve HTML ni un archivo de documento admitido.');
                name += extension;
            }
        }
        const type = documentFileType(name, html);
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of response) {
            size += chunk.length;
            if (size > type.maxBytes) throw new TopicActionError(413, 'El documento remoto supera el tamaño permitido.');
            chunks.push(Buffer.from(chunk));
        }
        let data = Buffer.concat(chunks);
        if (html) {
            let text: string;
            try { text = decodeDocumentHtml(data, contentType); }
            catch { throw new TopicActionError(400, 'No pudimos interpretar la codificación de la página.'); }
            if (!htmlPlainText(text)) throw new TopicActionError(400, 'La página no tiene texto disponible sin JavaScript.');
            data = Buffer.from(text);
        }
        directory = await mkdtemp(join(tmpdir(), 'ca-import-'));
        const path = join(directory, 'document');
        await writeFile(path, data);
        return await saveDocumentPath(ctx, storage, path, name, authorId, html);
    } finally {
        response.destroy();
        if (directory) await rm(directory, {recursive: true, force: true});
    }
}

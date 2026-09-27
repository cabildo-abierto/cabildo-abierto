import {cachedSearchDownload} from "./url.js";
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp, readFile, rm, writeFile, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {extname, join} from 'node:path';
import {createHash} from 'node:crypto';
import {parseCADocument} from '@cabildo-abierto/utils';
import type {ObjectStorage} from '../storage/storage.js';
import {downloadCSV} from '../datasets/download.js';
import {parseCSV} from '../datasets/csv.js';
import {convertOfficePath} from '../documents/conversion.js';
import {searchPlainText} from './index.js';
import {segmentSearchCSV, segmentSearchText} from './segments.js';
import type {SearchDatabase} from './schema.js';
import type {SearchSource} from './types.js';

const execute = promisify(execFile);

export async function extractSearchSource(database: SearchDatabase, source: SearchSource, getStorage: () => ObjectStorage, useCachedDownload = true) {
    const file = source.file_id ? await database.selectFrom('file').selectAll().where('id', '=', source.file_id).executeTakeFirstOrThrow() : null;
    const cached = source.source_url && useCachedDownload ? cachedSearchDownload(source.source_url) : undefined;
    const data = source.source_url ? cached ?? await downloadCSV(source.source_url) : await getStorage().read(file!);
    const hash = createHash('sha256').update(data).digest('hex');
    if (hash === source.content_hash) return {hash, segments: null};
    if (source.kind === 'dataset_file' || source.kind === 'dataset_url') {
        const csv = parseCSV(data);
        return {hash, segments: segmentSearchCSV(csv.columns.map(column => column.name), csv.rows)};
    }
    if (file!.format === 'text' || file!.format === 'markdown') {
        return {hash, segments: segmentSearchText(new TextDecoder('utf-8', {fatal: true}).decode(data), 'documento')};
    }
    if (file!.format === 'ca') {
        const document = parseCADocument(JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(data)));
        if (!document) throw new Error('Documento CA inválido');
        return {hash, segments: document.blocks.flatMap((block, index) => segmentSearchText(
            searchPlainText(typeof block.content === 'string' ? block.content : JSON.stringify(block.content)), 'documento', {block: index}
        ))};
    }
    const directory = await mkdtemp(join(tmpdir(), 'ca-search-'));
    try {
        const input = join(directory, `input${extname(file!.name)}`);
        let pdf = input;
        if (file!.format === 'office' && file!.preview_file_id) {
            const preview = await database.selectFrom('file').selectAll().where('id', '=', file!.preview_file_id).executeTakeFirstOrThrow();
            await writeFile(input, await getStorage().read(preview));
        } else {
            await writeFile(input, data);
            if (file!.format === 'office') pdf = await convertOfficePath(input, directory);
        }
        const output = join(directory, 'content.txt');
        await execute('pdftotext', ['-enc', 'UTF-8', '-layout', pdf, output], {timeout: 60_000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024});
        if ((await stat(output)).size > 100 * 1024 * 1024) throw new Error('El texto extraído supera 100 MB');
        const pages = (await readFile(output, 'utf8')).split('\f');
        const segments = pages.flatMap((text, index) => segmentSearchText(text, 'documento', {page: index + 1}));
        return {hash, segments};
    } finally { await rm(directory, {recursive: true, force: true}); }
}

import {datasetJob} from '../datasets/process.js';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp, readFile, rm, writeFile, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {extname, join} from 'node:path';
import {createHash} from 'node:crypto';
import {parseCADocument} from '@cabildo-abierto/utils';
import type {ObjectStorage} from '../storage/storage.js';
import {waitSnapshot} from '../datasets/snapshots.js';
import type {Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {SearchSegment} from './types.js';
import {convertOfficePath} from '../documents/conversion.js';
import {searchPlainText} from './index.js';
import {segmentSearchText} from './segments.js';
import type {SearchSource} from './types.js';

const execute = promisify(execFile);

export async function extractSearchSource(database: Kysely<DB>, source: SearchSource, getStorage: () => ObjectStorage) {
    if (source.kind === 'dataset') {
        const snapshot = await waitSnapshot(database,source.dataset_source_id!,getStorage());
        if(snapshot.content_hash === source.content_hash) return {hash:snapshot.content_hash,segments:null};
        const segments=await datasetJob<SearchSegment[]>('search',{url:await getStorage().signedUrl(snapshot,'inline','application/vnd.apache.parquet'),columns:snapshot.columns.map(c=>c.name)},120);
        return {hash:snapshot.content_hash,segments};
    }
    const file = source.file_id ? await database.selectFrom('file').selectAll().where('id', '=', source.file_id).executeTakeFirstOrThrow() : null;
    const data = await getStorage().read(file!);
    const hash = createHash('sha256').update(data).digest('hex');
    if (hash === source.content_hash) return {hash, segments:null};
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

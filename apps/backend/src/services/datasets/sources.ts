import {createHash} from 'node:crypto';
import type {Kysely, Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {TopicActionError} from '../topic-title-edits.js';

type Database = Kysely<DB> | Transaction<DB>;
export type DatasetSourceInput = {file_id: string | null; source_url: string | null};

// Called only by creation flows, after validating the source and file access.
export async function ensureDatasetSource(database: Database, input: DatasetSourceInput): Promise<string> {
    if ((input.file_id === null) === (input.source_url === null)) throw new TopicActionError(400, 'Elegí un archivo o una URL.');
    const id = createHash('sha256').update(input.file_id !== null ? `file:${input.file_id}` : `url:${input.source_url}`).digest('hex');
    await database.insertInto('dataset_source').values({id, file_id: input.file_id, source_url: input.source_url})
        .onConflict(conflict => conflict.column('id').doNothing()).execute();
    return id;
}

// Search retains its generic file/URL identity. Resolving it must never create a source.
export async function existingDatasetSource(database: Database, input: DatasetSourceInput): Promise<string> {
    const source = await database.selectFrom('dataset_source').select('id')
        .where(eb => eb.or([eb('file_id', '=', input.file_id), eb('source_url', '=', input.source_url)]))
        .executeTakeFirst();
    if (!source) throw new TopicActionError(404, 'No encontramos la fuente del conjunto de datos.');
    return source.id;
}

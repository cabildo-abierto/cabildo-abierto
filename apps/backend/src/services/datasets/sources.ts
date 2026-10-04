import {createHash} from 'node:crypto';
import type {Kysely, Transaction} from 'kysely';
import {datasetSourceOptions} from '@cabildo-abierto/utils';
import type {DB} from '#/db/types.js';
import {TopicActionError} from '../topic-title-edits.js';

type Database = Kysely<DB> | Transaction<DB>;
export type DatasetSourceInput = {file_id: string | null; source_url: string | null; source_format: 'csv' | 'json'; jq_filter: string | null};

// Called only by creation flows, after validating the source and file access.
export async function ensureDatasetSource(database: Database, input: DatasetSourceInput): Promise<string> {
    if ((input.file_id === null) === (input.source_url === null)) throw new TopicActionError(400, 'Elegí un archivo o una URL.');
    const options = datasetSourceOptions({sourceFormat: input.source_format, jqFilter: input.jq_filter});
    if (!options) throw new TopicActionError(400, 'El formato o la transformación del dataset no son válidos.');
    const origin = input.file_id !== null ? `file:${input.file_id}` : `url:${input.source_url}`;
    // Preserve existing CSV identities. JSON transformations have independent snapshots and indexes.
    const identity = options.sourceFormat === 'csv' ? origin : JSON.stringify(['json', origin, options.jqFilter]);
    const id = createHash('sha256').update(identity).digest('hex');
    await database.insertInto('dataset_source').values({id, ...input, jq_filter: options.jqFilter})
        .onConflict(conflict => conflict.column('id').doNothing()).execute();
    return id;
}

import {requireFileAccess} from '#/services/storage/access.js';
import type {Kysely, Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {TopicActionError} from '#/services/topic-title-edits.js';

export async function requireDatasetFileAccess(database: Kysely<DB> | Transaction<DB>, fileId: string, userId?: string, format: 'csv' | 'json' = 'csv') {
    return requireFileAccess(database, fileId, userId, format);
}
export async function requireDatasetAccess(database: Kysely<DB>, id: string) {
    const dataset = await database.selectFrom('dataset').innerJoin('dataset_source', 'dataset_source.id', 'dataset.source_id').innerJoin('block_version', 'block_version.id', 'dataset.id')
        .innerJoin('record', 'record.id', 'block_version.edit_id').innerJoin('topic', 'topic.id', 'block_version.topic_id')
        .select(['dataset.id','dataset.title','dataset.description','dataset.source_id','dataset_source.file_id','dataset_source.source_url','dataset_source.source_format','dataset_source.jq_filter','dataset.columns','dataset.csv_options',
            'topic.id as topicId','topic.title as topicTitle','topic.slug as topicSlug'])
        .where('dataset.id', '=', id).where('record.deleted', '=', false).where('block_version.deleted', '=', false).executeTakeFirst();
    if (!dataset) throw new TopicActionError(404, 'No encontramos ese conjunto de datos.');
    return dataset;
}

import {requireFileAccess} from '#/services/storage/access.js';
import type {Kysely, Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {TopicActionError} from '#/services/topic-title-edits.js';

export async function requireDatasetFileAccess(database: Kysely<DB> | Transaction<DB>, fileId: string, userId?: string) {
    return requireFileAccess(database, fileId, userId, 'csv');
}
export async function requireDatasetAccess(database: Kysely<DB>, id: string) {
    const dataset = await database.selectFrom('dataset').innerJoin('block_version', 'block_version.id', 'dataset.id')
        .innerJoin('record', 'record.id', 'block_version.edit_id').innerJoin('topic', 'topic.id', 'block_version.topic_id')
        .select(['dataset.id','dataset.title','dataset.description','dataset.file_id','dataset.source_url','dataset.columns','dataset.csv_options',
            'topic.id as topicId','topic.title as topicTitle','topic.slug as topicSlug'])
        .where('dataset.id', '=', id).where('record.deleted', '=', false).where('block_version.deleted', '=', false).executeTakeFirst();
    if (!dataset) throw new TopicActionError(404, 'No encontramos ese conjunto de datos.');
    return dataset;
}

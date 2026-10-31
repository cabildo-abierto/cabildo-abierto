import {sql} from 'kysely';
import {visibleTopic, topicAccessContext} from '../topic-access.js';
import type {Kysely, Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {TopicActionError} from '#/services/topic-title-edits.js';

export async function requireFileAccess(database: Kysely<DB> | Transaction<DB>, fileId: string, userId?: string, kind?: 'csv' | 'json' | 'document' | 'image') {
    let query = database.selectFrom('file').selectAll().where('id', '=', fileId).where('format', 'is not', null);
    if (kind === 'document') query = query.where('format', 'not in', ['csv','json','image']);
    else if (kind) query = query.where('format', '=', kind);
    if (database.isTransaction) query = query.forUpdate();
    const file = await query.executeTakeFirst();
    if (!file) throw new TopicActionError(404, 'No encontramos ese archivo.');
    const attachments = await database.selectFrom('block_version')
        .leftJoin('image', 'image.id', 'block_version.id').leftJoin('document', 'document.id', 'block_version.id')
        .leftJoin('dataset', 'dataset.id', 'block_version.id').leftJoin('dataset_source', 'dataset_source.id', 'dataset.source_id')
        .innerJoin('topic', 'topic.id', 'block_version.topic_id').select(['topic.id', 'topic.visibility'])
        .where(eb => eb.or([eb('image.file_id', '=', fileId), eb('document.file_id', '=', fileId), eb('dataset_source.file_id', '=', fileId)]))
        .execute();
    const privateAttachment = attachments.filter(topic => topic.visibility === 'private');
    const publiclyAvailable = attachments.some(topic => topic.visibility === 'public');
    const context = topicAccessContext.getStore();
    if (!publiclyAvailable && context?.topicId && privateAttachment.some(topic => topic.id !== context.topicId)) {
        throw new TopicActionError(404, 'No encontramos ese archivo.');
    }
    if (file.author_id === userId && !privateAttachment.length) return file;
    const published = await database.selectFrom('block_version')
        .leftJoin('image', 'image.id', 'block_version.id')
        .leftJoin('document', 'document.id', 'block_version.id').leftJoin('dataset', 'dataset.id', 'block_version.id')
        .leftJoin('dataset_source', 'dataset_source.id', 'dataset.source_id')
        .innerJoin('record', 'record.id', 'block_version.edit_id').select('block_version.id')
        .where(eb => eb.or([eb('document.file_id', '=', fileId), eb('dataset_source.file_id', '=', fileId), eb('image.file_id', '=', fileId)]))
        .where(visibleTopic(sql.ref('block_version.topic_id'))).where('record.deleted', '=', false).where('block_version.deleted', '=', false).executeTakeFirst();
    if (!published) throw new TopicActionError(404, 'No encontramos ese archivo.');
    return file;
}

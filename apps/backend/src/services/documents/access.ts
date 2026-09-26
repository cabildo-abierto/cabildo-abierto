import type {Kysely, Transaction} from "kysely";
import type {DB} from "#/db/types.js";
import {TopicActionError} from "#/services/topic-title-edits.js";

type Database = Kysely<DB> | Transaction<DB>;

export async function requireDocumentFileAccess(database: Database, fileId: string, userId?: string) {
    const file = await database.selectFrom('file').selectAll().where('id', '=', fileId).where('format', 'is not', null).executeTakeFirst();
    if (!file) throw new TopicActionError(404, 'No encontramos ese archivo.');
    const publication = await database.selectFrom('document').innerJoin('block_version', 'block_version.id', 'document.id')
        .innerJoin('record', 'record.id', 'block_version.edit_id').select('document.id')
        .where('document.file_id', '=', fileId).where('record.deleted', '=', false).where('block_version.deleted', '=', false).executeTakeFirst();
    if (!publication && file.author_id !== userId) throw new TopicActionError(404, 'No encontramos ese archivo.');
    return file;
}

export async function requireDocumentAccess(database: Database, id: string) {
    const doc = await database.selectFrom('document').innerJoin('block_version', 'block_version.id', 'document.id')
        .innerJoin('record', 'record.id', 'block_version.edit_id').innerJoin('file', 'file.id', 'document.file_id')
        .select(['document.id', 'document.title', 'document.description', 'document.file_id', 'block_version.topic_id', 'block_version.edit_id',
            'file.format', 'file.preview_file_id', 'file.preview_status', 'file.preview_error', 'record.author_id'])
        .where('document.id', '=', id).where('record.deleted', '=', false).where('block_version.deleted', '=', false).executeTakeFirst();
    if (!doc) throw new TopicActionError(404, 'No encontramos ese documento.');
    return doc;
}

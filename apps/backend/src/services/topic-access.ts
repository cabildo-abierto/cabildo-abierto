import {AsyncLocalStorage} from 'node:async_hooks';
import {sql, type Kysely, type Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {TopicActionError} from './topic-title-edits.js';

type Database = Kysely<DB> | Transaction<DB>;
// Request-scoped identity also reaches nested dataset and visualization resolvers.
export const topicAccessContext = new AsyncLocalStorage<{userId: string | null; topicId?: string}>();
export function visibleTopic(topicId = sql.ref('topic.id')) {
    const userId = topicAccessContext.getStore()?.userId ?? null;
    return sql<boolean>`EXISTS (SELECT 1 FROM topic AS accessible_topic WHERE accessible_topic.id = ${topicId}
        AND (accessible_topic.visibility = 'public' OR EXISTS (SELECT 1 FROM topic_member
            WHERE topic_member.topic_id = accessible_topic.id AND topic_member.user_id = ${userId})))`;
}
export async function requireTopicAccess(database: Database, reference: string, admin = false) {
    const userId = topicAccessContext.getStore()?.userId ?? null;
    let query = database.selectFrom('topic').selectAll()
        .where(eb => eb.or([eb('topic.id', '=', reference), eb.exists(eb.selectFrom('topic_redirect')
            .select('slug').whereRef('topic_redirect.topic_id', '=', 'topic.id').where('slug', '=', reference))]))
        .where(visibleTopic());
    if (database.isTransaction) query = query.forShare();
    const row = await query.executeTakeFirst();
    if (!row) throw new TopicActionError(404, 'No encontramos ese tema.');
    const membership = userId ? await database.selectFrom('topic_member').select('role')
        .where('topic_id', '=', row.id).where('user_id', '=', userId).executeTakeFirst() : undefined;
    if (row.visibility === 'private' && !membership) throw new TopicActionError(404, 'No encontramos ese tema.');
    if (admin && (row.visibility !== 'private' || membership?.role !== 'admin')) {
        throw new TopicActionError(403, 'Solo los administradores pueden gestionar el acceso.');
    }
    return {...row, role: membership?.role ?? null};
}
export async function requireTopicSource(database: Database, reference: string) {
    const topic = await requireTopicAccess(database, reference);
    if (topic.visibility === 'private' && topicAccessContext.getStore()?.topicId !== topic.id) {
        throw new TopicActionError(404, 'No encontramos esa fuente.');
    }
    return topic;
}

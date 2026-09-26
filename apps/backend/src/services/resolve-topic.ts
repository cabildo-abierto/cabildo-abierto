import type {Kysely, Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {TopicActionError} from './topic-title-edits.js';

export async function resolveTopic(database: Kysely<DB> | Transaction<DB>, reference: string) {
    const topic = await database.selectFrom('topic').select(['id','title','slug']).where('id','=',reference).executeTakeFirst();
    if (topic) return topic;
    const alias = await database.selectFrom('topic_redirect').innerJoin('topic','topic.id','topic_redirect.topic_id')
        .select(['topic.id','topic.title','topic.slug']).where('topic_redirect.slug','=',reference).executeTakeFirst();
    if (!alias) throw new TopicActionError(404,'No encontramos ese tema.');
    return alias;
}

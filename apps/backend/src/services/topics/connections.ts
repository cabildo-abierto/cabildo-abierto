import {sql, type Kysely} from 'kysely';
import type {TopicConnectionCounts} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';

export async function topicConnectionCounts(database: Kysely<DB>, topicIds: string[]) {
    const counts = new Map<string, TopicConnectionCounts>(topicIds.map(id => [id, {reading: 0, editing: 0}]));
    if (!topicIds.length) return counts;
    const result = await sql<TopicConnectionCounts & {topic_id: string}>`
        WITH viewers AS (
            SELECT topic_id, viewer_id, bool_or(mode = 'editing') AS editing
            FROM topic_connection
            WHERE topic_id = ANY(${topicIds}::text[]) AND expires_at > statement_timestamp()
                AND mode IN ('reading', 'editing')
            GROUP BY topic_id, viewer_id
        )
        SELECT topic_id, count(*) FILTER (WHERE NOT editing)::int AS reading,
            count(*) FILTER (WHERE editing)::int AS editing
        FROM viewers GROUP BY topic_id
    `.execute(database);
    for (const {topic_id, reading, editing} of result.rows) counts.set(topic_id, {reading, editing});
    return counts;
}

export async function withTopicConnectionCounts<Result extends {topic: {id: string}}>(database: Kysely<DB>, results: Result[]) {
    const counts = await topicConnectionCounts(database, results.map(result => result.topic.id));
    return results.map(result => ({...result, connections: counts.get(result.topic.id)!}));
}

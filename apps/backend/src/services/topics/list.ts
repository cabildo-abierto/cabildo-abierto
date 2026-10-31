import {sql, type Kysely} from 'kysely';
import type {TopicListOutput} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';

export async function listTopics(database: Kysely<DB>, options: {offset: number; limit: number}): Promise<TopicListOutput> {
    const result = await sql<{totalTopics: number; results: TopicListOutput['results']}>`
        WITH topic_activity AS (
            SELECT edit.topic_id, record.author_id, record.created_at
            FROM edit JOIN record ON record.id = edit.id
            UNION ALL
            SELECT comment.topic_id, record.author_id, record.created_at
            FROM comment JOIN record ON record.id = comment.id
            UNION ALL
            SELECT coalesce(reason.topic_id, subject_edit.topic_id), record.author_id, record.created_at
            FROM reaction JOIN record ON record.id = reaction.id
            LEFT JOIN comment AS reason ON reason.id = reaction.reason_id
            LEFT JOIN edit AS subject_edit ON subject_edit.id = reaction.subject_id
            WHERE reason.topic_id IS NOT NULL OR subject_edit.topic_id IS NOT NULL
        ), ranked AS (
            SELECT topic.id, topic.title, topic.slug, row_number() OVER (ORDER BY
                count(DISTINCT topic_activity.author_id) FILTER (WHERE topic_activity.created_at >= now() - interval '7 days') DESC,
                count(topic_activity.author_id) DESC,
                min(topic_activity.created_at) DESC NULLS FIRST, topic.title ASC, topic.id ASC
            ) AS position
            FROM topic LEFT JOIN topic_activity ON topic_activity.topic_id = topic.id
            GROUP BY topic.id
        ), page AS (SELECT * FROM ranked ORDER BY position LIMIT ${options.limit} OFFSET ${options.offset})
        SELECT (SELECT count(*)::int FROM ranked) AS "totalTopics",
            coalesce((SELECT json_agg(json_build_object(
                'topic', json_build_object('id', id, 'title', title, 'slug', slug),
                'matchCount', 0, 'matches', '[]'::json
            ) ORDER BY position) FROM page), '[]'::json) AS results
    `.execute(database);
    return {...result.rows[0], totalMatches: 0, offset: options.offset, limit: options.limit};
}

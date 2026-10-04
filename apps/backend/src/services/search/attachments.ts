import {sql} from 'kysely';
import type {TopicSummary} from '@cabildo-abierto/api';
import type {SearchDatabase} from './schema.js';
import {searchQueries, searchMatches} from './matching.js';

type AttachmentResult = {
    id: string; blockNumber: string; typeId: 'documento' | 'dataset'; order: string; deleted: false; topic: TopicSummary;
};

export async function searchAttachments(database: SearchDatabase, options: {
    q: string; type: AttachmentResult['typeId']; topicId?: string; preferredTopicId?: string; page: number; pageSize?: number;
}) {
    const pageSize = options.pageSize ?? 12;
    const q = options.q.trim();
    const matches = q ? searchMatches(await searchQueries(database, q), {history: false, types: [options.type], comments: false}) : null;
    const relevance = matches ? sql`title_match DESC, rank DESC,` : sql``;
    const preferred = !matches && options.preferredTopicId ? sql`(topic_id = ${options.preferredTopicId}) DESC,` : sql``;
    const output = await sql<{results: AttachmentResult[]; total: number; page: number}>`
        WITH candidates AS (
            SELECT v.id, v.topic_id, v.block_number, v."order", b.type_id,
                t.title AS topic_title, t.slug AS topic_slug,
                ${matches ? sql`bool_or(m.title_match)` : sql`false`} AS title_match,
                ${matches ? sql`max(m.rank)` : sql`0`} AS rank
            FROM search_reference r
            ${matches ? sql`JOIN (${matches}) m ON m.source_id = r.source_id`
                : sql`JOIN search_source s ON s.id = r.source_id AND s.kind = 'block_version'`}
            JOIN block_version v ON v.id = r.block_version_id
            JOIN block b ON b.topic_id = v.topic_id AND b.block_number = v.block_number
            JOIN record vr ON vr.id = v.edit_id
            JOIN topic t ON t.id = v.topic_id
            WHERE r.is_visible AND r.is_current AND NOT v.deleted AND NOT vr.deleted AND b.type_id = ${options.type}
                ${options.topicId ? sql`AND r.topic_id = ${options.topicId}` : sql``}
            GROUP BY v.id, v.topic_id, v.block_number, v."order", b.type_id, t.title, t.slug
        ), totals AS (SELECT count(*)::int AS total FROM candidates),
        pagination AS (SELECT total, least(${options.page}, greatest(0, (total - 1) / ${pageSize})) AS page FROM totals),
        page AS (
            SELECT * FROM candidates ORDER BY ${relevance} ${preferred} topic_title, topic_id, block_number, id
            LIMIT ${pageSize} OFFSET (SELECT page * ${pageSize} FROM pagination)
        )
        SELECT pagination.total, pagination.page, coalesce((SELECT json_agg(json_build_object(
            'id', id, 'blockNumber', block_number, 'typeId', type_id, 'order', "order", 'deleted', false,
            'topic', json_build_object('id', topic_id, 'title', topic_title, 'slug', topic_slug)
        ) ORDER BY ${relevance} ${preferred} topic_title, topic_id, block_number, id) FROM page), '[]'::json) AS results FROM pagination
    `.execute(database);
    return {...output.rows[0], pageSize};
}

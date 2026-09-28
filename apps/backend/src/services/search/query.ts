import {randomUUID} from 'node:crypto';
import {sql, type Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {BlockType, ContentSearchOutput, ContentSearchResult, SearchSnippet} from '@cabildo-abierto/api';

export type SearchOptions = {q: string; history: boolean; types: BlockType['id'][]; comments: boolean; offset: number; limit: number};

async function searchQueries(database: Kysely<DB>, input: string) {
    const parts = [...input.matchAll(/"([^"]*)"|([^\s"]+)/g)].map(match => ({text: match[1] ?? match[2], quoted: match[1] !== undefined}));
    const tokens = parts.map((part, index) => ({...part, prefix: !part.quoted && index === parts.length - 1, ordinal: index}));
    const rows = await sql<{config: string; query: string; ordinal: number}>`
        SELECT config, ordinal,
            CASE WHEN quoted THEN phraseto_tsquery(config::regconfig, text)::text
                 WHEN prefix THEN (SELECT string_agg(quote_literal(word) || ':*', ' & ')
                    FROM unnest(tsvector_to_array(CASE WHEN numnode(plainto_tsquery(config::regconfig, text)) = 0
                        THEN to_tsvector('public.search_simple'::regconfig, text) ELSE to_tsvector(config::regconfig, text) END)) AS word)
                 ELSE plainto_tsquery(config::regconfig, text)::text END AS query
        FROM jsonb_to_recordset(${JSON.stringify(tokens)}::jsonb) AS token(text text, quoted boolean, prefix boolean, ordinal integer)
        CROSS JOIN (VALUES ('public.search_spanish'), ('public.search_spanish_all'), ('public.search_simple')) AS configs(config)
        ORDER BY ordinal`.execute(database);
    const queryFor = (config: string) => rows.rows.filter(row => row.config === config && row.query).map(row => `(${row.query})`).join(' & ');
    return {spanish: queryFor('public.search_spanish'), spanishAll: queryFor('public.search_spanish_all'), simple: queryFor('public.search_simple')};
}

export function parseSearchHeadline(headline: string, startMarker: string, endMarker: string): SearchSnippet {
    let text = '', position = 0;
    const highlights: SearchSnippet['highlights'] = [];
    while (position < headline.length) {
        const start = headline.indexOf(startMarker, position);
        if (start === -1) { text += headline.slice(position); break; }
        const end = headline.indexOf(endMarker, start + startMarker.length);
        if (end === -1) { text += headline.slice(position); break; }
        text += headline.slice(position, start);
        const begin = text.length;
        text += headline.slice(start + startMarker.length, end);
        highlights.push({start: begin, end: text.length});
        position = end + endMarker.length;
    }
    const firstMatch = highlights[0]?.start ?? 0;
    let from = Math.max(0, firstMatch - 60);
    // Preserve nearby context and avoid starting in the middle of a word.
    if (from > 0 && !/\s/.test(text[from - 1])) {
        const boundary = text.slice(from, firstMatch).search(/\s/);
        from = boundary >= 0 ? from + boundary + 1 : firstMatch;
    }
    if (from > 0 && /[\uDC00-\uDFFF]/.test(text[from])) from--;
    let to = Math.min(text.length, from + 180);
    if (to < text.length && /[\uD800-\uDBFF]/.test(text[to - 1])) to--;
    const prefix = from ? '...' : '';
    return {
        text: prefix + text.slice(from, to) + (to < text.length ? '...' : ''),
        highlights: highlights.filter(range => range.end > from && range.start < to).map(range => ({
            start: Math.max(range.start, from) - from + prefix.length,
            end: Math.min(range.end, to) - from + prefix.length,
        })),
    };
}

export async function searchContent(database: Kysely<DB>, options: SearchOptions): Promise<ContentSearchOutput> {
    const {spanish, spanishAll, simple} = await searchQueries(database, options.q);
    const marker = randomUUID().replaceAll('-', '');
    const start = `MATCHSTART${marker}`, end = `MATCHEND${marker}`;
    // PostgreSQL marks matches using the same normalization as the index; crop afterwards
    // so its fragment selection cannot discard nearby stop words or hide where text was cut.
    const headlineOptions = `StartSel=${start}, StopSel=${end}, HighlightAll=true`;
    const currentEntry = options.history ? sql`true` : sql`e.is_current`;
    const currentReference = options.history ? sql`true` : sql`r.is_current`;
    const types = options.types.length ? sql`e.block_type_id = ANY(${options.types}::text[])` : sql`true`;
    const comments = options.comments ? sql`true` : sql`s.kind <> 'comment'`;
    type RawResult = Omit<ContentSearchResult, 'snippet'> & {headline: string};
    const output = await sql<{totalTopics: number; totalMatches: number; results: RawResult[]}>`
        WITH matches AS MATERIALIZED (
            SELECT e.id, e.source_id,
                ts_rank_cd(e.search_vector, q.query) AS rank,
                to_tsvector(e.search_config, e.title_text) @@ q.query AS title_match,
                s.kind = 'topic_title' AS topic_title
            FROM search_entry e JOIN search_source s ON s.id = e.source_id
            CROSS JOIN LATERAL (SELECT CASE
                WHEN e.search_config = 'public.search_simple'::regconfig THEN ${simple}::tsquery
                WHEN e.search_config = 'public.search_spanish_all'::regconfig THEN ${spanishAll}::tsquery
                ELSE ${spanish}::tsquery END AS query) q
            WHERE e.is_visible AND ${currentEntry} AND ${types} AND ${comments}
                AND ((e.search_config = 'public.search_spanish'::regconfig AND e.search_vector @@ ${spanish}::tsquery)
                  OR (e.search_config = 'public.search_spanish_all'::regconfig AND e.search_vector @@ ${spanishAll}::tsquery)
                  OR (e.search_config = 'public.search_simple'::regconfig AND e.search_vector @@ ${simple}::tsquery))
        ), matched_references AS MATERIALIZED (
            SELECT DISTINCT ON (m.id, r.topic_id) m.id, m.rank, m.title_match, m.topic_title, r.topic_id, r.block_version_id, r.comment_id,
                r.is_current, coalesce(d.title, ds.title) AS attachment_title
            FROM matches m JOIN search_reference r ON r.source_id = m.source_id
            LEFT JOIN block_version v ON v.id = r.block_version_id
            LEFT JOIN record vr ON vr.id = v.edit_id
            LEFT JOIN document d ON d.id = v.id LEFT JOIN dataset ds ON ds.id = v.id
            WHERE r.is_visible AND ${currentReference}
            ORDER BY m.id, r.topic_id, r.is_current DESC, vr.created_at DESC NULLS LAST, r.id DESC
        ), ranked AS (
            SELECT *, count(*) OVER (PARTITION BY topic_id) AS match_count,
                row_number() OVER (PARTITION BY topic_id ORDER BY title_match DESC, topic_title DESC, rank DESC, is_current DESC, id DESC) AS position
            FROM matched_references
        ), topics AS MATERIALIZED (SELECT * FROM ranked WHERE position = 1),
        page AS (
            SELECT * FROM topics ORDER BY match_count DESC, rank DESC, topic_id ASC LIMIT ${options.limit} OFFSET ${options.offset}
        ), results AS (
            SELECT p.match_count, p.rank, p.topic_id,
                json_build_object(
                    'topic', json_build_object('id', t.id, 'title', t.title, 'slug', t.slug),
                    'matchCount', p.match_count, 'entryId', e.id::text, 'kind', s.kind,
                    'blockType', e.block_type_id, 'versionId', p.block_version_id, 'commentId', p.comment_id,
                    'comment', CASE WHEN cr.id IS NOT NULL THEN json_build_object(
                        'author', json_build_object('id', ca.id, 'username', ca.username), 'createdAt', cr.created_at
                    ) ELSE NULL END,
                    'attachmentTitle', p.attachment_title, 'historical', NOT p.is_current,
                    'headline', ts_headline(e.search_config,
                        CASE WHEN p.title_match THEN e.title_text
                            WHEN to_tsvector(e.search_config, e.body_text) @@ q.query THEN e.body_text
                            ELSE concat_ws('\n', nullif(e.title_text, ''), nullif(e.body_text, '')) END,
                        q.query, ${headlineOptions})
                ) AS result
            FROM page p JOIN topic t ON t.id = p.topic_id JOIN search_entry e ON e.id = p.id
            JOIN search_source s ON s.id = e.source_id
            LEFT JOIN record cr ON cr.id = p.comment_id
            LEFT JOIN public."user" ca ON ca.id = cr.author_id
            CROSS JOIN LATERAL (SELECT CASE
                WHEN e.search_config = 'public.search_simple'::regconfig THEN ${simple}::tsquery
                WHEN e.search_config = 'public.search_spanish_all'::regconfig THEN ${spanishAll}::tsquery
                ELSE ${spanish}::tsquery END AS query) q
        )
        SELECT (SELECT count(*)::int FROM topics) AS "totalTopics",
            coalesce((SELECT sum(match_count)::int FROM topics), 0) AS "totalMatches",
            coalesce((SELECT json_agg(result ORDER BY match_count DESC, rank DESC, topic_id ASC) FROM results), '[]'::json) AS results
    `.execute(database);
    const row = output.rows[0];
    return {...row, limit: options.limit, offset: options.offset, results: row.results.map(({headline, ...result}) => ({
        ...result, snippet: parseSearchHeadline(headline, start, end),
    }))};
}

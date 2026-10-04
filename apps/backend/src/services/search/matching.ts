import {sql} from 'kysely';
import type {BlockType} from '@cabildo-abierto/api';
import type {SearchDatabase} from './schema.js';

export async function searchQueries(database: SearchDatabase, input: string) {
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

export function searchMatches(queries: Awaited<ReturnType<typeof searchQueries>>, options: {history: boolean; types: BlockType['id'][]; comments: boolean}) {
    const {spanish, spanishAll, simple} = queries;
    const currentEntry = options.history ? sql`true` : sql`e.is_current`;
    const types = options.types.length ? sql`e.block_type_id = ANY(${options.types}::text[])` : sql`true`;
    const comments = options.comments ? sql`true` : sql`s.kind <> 'comment'`;
    return sql`
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
                  OR (e.search_config = 'public.search_simple'::regconfig AND e.search_vector @@ ${simple}::tsquery))`;
}

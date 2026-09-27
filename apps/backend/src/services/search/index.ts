import {env} from "#/lib/env.js";
import {sql} from 'kysely';
import {parseRichTextContent, richTextParagraphs, parseDocumentBlock, parseDatasetBlock, parseImageBlock, parseVisualizationBlock} from '@cabildo-abierto/utils';
import type {BlockType} from '@cabildo-abierto/api';
import {topicConvergence} from '../topic-convergence.js';
import {currentTopicTitleEdit} from '../topic-title-edits.js';
import {documentBlockContent} from '../documents/block-content.js';
import {searchTable, type SearchDatabase} from './schema.js';
import type {SearchSegment, SearchSourceKind} from './types.js';
import {notifySearchPending} from './notifications.js';

export function searchPlainText(content: string): string {
    const richText = parseRichTextContent(content);
    if (!richText) return content;
    return richTextParagraphs(richText.doc).map(paragraph => (paragraph.content ?? []).map(node => {
        if (node.type === 'text') return node.text;
        if (node.type === 'hard_break') return '\n';
        const attrs = node.attrs;
        if (!('kind' in attrs) || attrs.kind === 'text') return ` ${attrs.content} `;
        return attrs.kind === 'url' ? ` ${attrs.label || attrs.url} ` : '';
    }).join('')).join('\n');
}

const sourceFields = {
    block_version: 'block_version_id', topic_title: 'title_edit_id', comment: 'comment_id',
    document_file: 'file_id', dataset_file: 'file_id', dataset_url: 'source_url',
} as const;

export async function ensureSearchSource(database: SearchDatabase, kind: SearchSourceKind, owner: string, schema = 'public'): Promise<string> {
    const field = sql.ref(sourceFields[kind]);
    const table = searchTable('source', schema);
    const inserted = await sql<{id: string}>`INSERT INTO ${table} (kind, ${field}) VALUES (${kind}, ${owner})
        ON CONFLICT DO NOTHING RETURNING id`.execute(database);
    if (inserted.rows[0]) return inserted.rows[0].id;
    const existing = await sql<{id: string}>`SELECT id FROM ${table} WHERE kind = ${kind} AND ${field} = ${owner}`.execute(database);
    return existing.rows[0].id;
}

export async function replaceSearchSegments(database: SearchDatabase, sourceId: string, segments: SearchSegment[], schema = 'public') {
    const table = searchTable('entry', schema);
    await sql`DELETE FROM ${table} WHERE source_id = ${sourceId}`.execute(database);
    for (let offset = 0; offset < segments.length; offset += 200) {
        const values = segments.slice(offset, offset + 200).map((segment, index) => sql`(
            ${sourceId}, ${offset + index}, ${segment.type}, ${segment.title.replaceAll('\0', '')}, ${segment.text.replaceAll('\0', '')},
            ${JSON.stringify(segment.location)}::jsonb, ${`public.${segment.config ?? 'search_spanish'}`}::regconfig
        )`);
        await sql`INSERT INTO ${table} (source_id, segment_number, block_type_id, title_text, body_text, location, search_config)
            VALUES ${sql.join(values)}`.execute(database);
    }
    await updateSearchEntryVisibility(database, [sourceId], schema);
}

export async function updateSearchEntryVisibility(database: SearchDatabase, sourceIds: string[], schema = 'public') {
    if (!sourceIds.length) return;
    await sql`UPDATE ${searchTable('entry', schema)} e SET is_visible = flags.visible, is_current = flags.current
        FROM (SELECT source_id, bool_or(is_visible) AS visible, bool_or(is_current) AS current
            FROM ${searchTable('reference', schema)} WHERE source_id = ANY(${sourceIds}::bigint[]) GROUP BY source_id) flags
        WHERE e.source_id = flags.source_id AND (e.is_visible, e.is_current) IS DISTINCT FROM (flags.visible, flags.current)`.execute(database);
}

function blockSegment(type: BlockType['id'], content: string): SearchSegment {
    let title = '', text = '';
    if (type === 'documento' || type === 'dataset') {
        const value = type === 'documento' ? parseDocumentBlock(content) : parseDatasetBlock(content);
        title = value?.title ?? ''; text = value?.description ?? '';
    } else if (type === 'visualizacion') {
        const value = parseVisualizationBlock(content);
        title = value?.spec.title ?? ''; text = value?.spec.description ?? '';
    } else if (type === 'imagen') {
        const value = parseImageBlock(content);
        text = [value?.caption, value?.alt].filter(Boolean).join('\n');
    } else if (type === 'h1' || type === 'h2') title = searchPlainText(content);
    else text = searchPlainText(content);
    return {title, text, type, location: {}};
}

async function addReference(database: SearchDatabase, sourceId: string, topicId: string, field: 'block_version_id' | 'title_edit_id' | 'comment_id', owner: string, schema: string) {
    await sql`INSERT INTO ${searchTable('reference', schema)} (source_id, topic_id, ${sql.ref(field)})
        VALUES (${sourceId}, ${topicId}, ${owner}) ON CONFLICT DO NOTHING`.execute(database);
}

async function indexMetadata(database: SearchDatabase, topicId: string, kind: 'block_version' | 'topic_title' | 'comment', owner: string, segment: SearchSegment, schema: string) {
    const id = await ensureSearchSource(database, kind, owner, schema);
    await addReference(database, id, topicId, sourceFields[kind], owner, schema);
    await replaceSearchSegments(database, id, [segment], schema);
    await sql`UPDATE ${searchTable('source', schema)} SET status = 'ready', indexed_generation = generation, indexed_at = now() WHERE id = ${id}`.execute(database);
}

export async function synchronizeTopicSearch(database: SearchDatabase, topicId: string, schema = 'public') {
    const source = searchTable('source', schema), reference = searchTable('reference', schema);
    const missingBlocks = await sql<{id: string; type: BlockType['id']; content: string; deleted: boolean}>`
        SELECT block_version.id, block.type_id AS type, ${documentBlockContent()} AS content, block_version.deleted
        FROM block_version JOIN block USING(topic_id, block_number)
        LEFT JOIN document ON document.id = block_version.id
        LEFT JOIN ${source} s ON s.block_version_id = block_version.id
        WHERE block_version.topic_id = ${topicId} AND s.id IS NULL`.execute(database);
    for (const block of missingBlocks.rows) {
        await indexMetadata(database, topicId, 'block_version', block.id, blockSegment(block.type, block.deleted ? '' : block.content), schema);
        if (block.deleted) continue;
        const attachment = block.type === 'documento' ? parseDocumentBlock(block.content) : block.type === 'dataset' ? parseDatasetBlock(block.content) : null;
        if (attachment) {
            const kind = block.type === 'documento' ? 'document_file' : attachment.fileId ? 'dataset_file' : 'dataset_url';
            const owner = attachment.fileId ?? ('sourceUrl' in attachment ? attachment.sourceUrl : null);
            if (owner) {
                const contentId = await ensureSearchSource(database, kind, owner, schema);
                await addReference(database, contentId, topicId, 'block_version_id', block.id, schema);
                if (kind === 'dataset_url') await requestUrlIndex(database, owner, schema);
            }
        }
    }
    const missingTitles = await sql<{id: string; title: string}>`SELECT edit.id, edit.title FROM edit
        LEFT JOIN ${source} s ON s.title_edit_id = edit.id
        WHERE edit.topic_id = ${topicId} AND edit.title IS NOT NULL AND s.id IS NULL`.execute(database);
    for (const title of missingTitles.rows) {
        await indexMetadata(database, topicId, 'topic_title', title.id, {title: title.title, text: '', type: null, location: {}}, schema);
    }
    const missingComments = await sql<{id: string; content: string; type: BlockType['id'] | null}>`
        SELECT comment.id, comment.content, coalesce(block.type_id, CASE WHEN comment.document_block_id IS NOT NULL THEN 'documento' END) AS type
        FROM comment LEFT JOIN block ON block.topic_id = comment.topic_id AND block.block_number = comment.block_number
        LEFT JOIN ${source} s ON s.comment_id = comment.id
        WHERE comment.topic_id = ${topicId} AND s.id IS NULL`.execute(database);
    for (const comment of missingComments.rows) {
        await indexMetadata(database, topicId, 'comment', comment.id, {title: '', text: comment.content, type: comment.type, location: {}}, schema);
    }
    const blocks = await topicConvergence(database, topicId);
    const currentIds = blocks.filter(block => !block.deleted).map(block => block.id);
    const titleId = await currentTopicTitleEdit(database, topicId);
    await sql`UPDATE ${reference} r SET is_visible = flags.visible, is_current = flags.visible AND flags.current
        FROM (
            SELECT r.id,
                CASE WHEN r.block_version_id IS NOT NULL THEN NOT vr.deleted AND NOT v.deleted
                     WHEN r.title_edit_id IS NOT NULL THEN NOT tr.deleted
                     ELSE NOT cr.deleted AND NOT root.deleted END AS visible,
                CASE WHEN r.block_version_id IS NOT NULL THEN r.block_version_id = ANY(${currentIds}::text[])
                     WHEN r.title_edit_id IS NOT NULL THEN r.title_edit_id = ${titleId}
                     ELSE true END AS current
            FROM ${reference} r
            LEFT JOIN block_version v ON v.id = r.block_version_id LEFT JOIN record vr ON vr.id = v.edit_id
            LEFT JOIN record tr ON tr.id = r.title_edit_id
            LEFT JOIN comment c ON c.id = r.comment_id LEFT JOIN record cr ON cr.id = c.id LEFT JOIN record root ON root.id = c.root_id
            WHERE r.topic_id = ${topicId}
        ) flags WHERE r.id = flags.id AND (r.is_visible, r.is_current) IS DISTINCT FROM (flags.visible, flags.visible AND flags.current)`.execute(database);
    const ids = await sql<{source_id: string}>`SELECT DISTINCT source_id FROM ${reference} WHERE topic_id = ${topicId}`.execute(database);
    await updateSearchEntryVisibility(database, ids.rows.map(row => row.source_id), schema);
    if (schema === 'public') await notifySearchPending(database);
}

export async function requestUrlIndex(database: SearchDatabase, url: string, schema = 'public', refreshSeconds = env.SEARCH_URL_REFRESH_SECONDS) {
    const updated = await sql`UPDATE ${searchTable('source', schema)} SET generation = generation + 1, status = 'pending', attempts = 0, retry_at = now()
        WHERE source_url = ${url} AND (indexed_generation = generation OR (status = 'failed' AND attempts >= 5))
          AND (last_checked_at IS NULL OR last_checked_at < now() - ${refreshSeconds} * interval '1 second') RETURNING id`.execute(database);
    if (schema === 'public' && updated.rows.length) await notifySearchPending(database);
}

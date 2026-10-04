import {sql, type Kysely, type Transaction} from 'kysely';
import type {BlockType, TopicEditableBlock} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';
import {compareContentBlocks, parseImageBlock, parseVisualizationBlock, parseDocumentBlock, parseDatasetBlock} from '@cabildo-abierto/utils';
import {documentBlockContent} from './documents/block-content.js';
import {activeRejectCounts, rejectTree} from './record-reactions.js';

type StoredTopicBlock = {
    id: string;
    editId: string;
    blockNumber: string;
    typeId: BlockType["id"];
    order: string;
    deleted: boolean;
};

export async function topicConvergenceReferences(database: Kysely<DB> | Transaction<DB>, topicId: string, typeId?: "documento" | "dataset") {
    const blockResult = await sql<StoredTopicBlock>`
        SELECT block_version.id,
               block_version.edit_id AS "editId",
               block_version.block_number AS "blockNumber",
               block.type_id AS "typeId",
               block_version.order,
               block_version.deleted
        FROM block_version
        INNER JOIN block
            ON block.topic_id = block_version.topic_id
           AND block.block_number = block_version.block_number
        INNER JOIN edit ON edit.id = block_version.edit_id
        INNER JOIN record ON record.id = edit.id
        WHERE block_version.topic_id = ${topicId}
          AND record.deleted = false
          ${typeId ? sql`AND block.type_id = ${typeId}` : sql``}
        ORDER BY block_version.block_number, record.created_at DESC, record.id DESC
    `.execute(database);
    const rejectCounts = activeRejectCounts(await rejectTree(database, [...new Set(blockResult.rows.map(block => block.editId))]));
    const selected = new Map<string, StoredTopicBlock>();
    const latest = new Map<string, StoredTopicBlock>();
    for (const block of blockResult.rows) {
        if (!latest.has(block.blockNumber)) latest.set(block.blockNumber, block);
        if (!selected.has(block.blockNumber) && (rejectCounts.get(block.editId) ?? 0) === 0) selected.set(block.blockNumber, block);
    }
    for (const [blockNumber, block] of latest) {
        if (!selected.has(blockNumber)) selected.set(blockNumber, {...block, deleted: true});
    }
    return [...selected.values()].sort(compareContentBlocks).map(({editId: _editId, ...block}) => block);
}

type BlockReference = Awaited<ReturnType<typeof topicConvergenceReferences>>[number];

export async function loadConvergedBlocks(database: Kysely<DB> | Transaction<DB>, references: BlockReference[]): Promise<TopicEditableBlock[]> {
    if (!references.length) return [];
    const result = await sql<{id: string; content: string; commentCount: number}>`
        SELECT block_version.id, ${documentBlockContent()} AS content,
            (SELECT count(*)::int FROM comment WHERE comment.topic_id = block_version.topic_id
                AND comment.block_number = block_version.block_number AND comment.reply_to_id = comment.root_id) AS "commentCount"
        FROM block_version LEFT JOIN document ON document.id = block_version.id
        WHERE block_version.id IN (${sql.join(references.map(block => sql`${block.id}`))})
    `.execute(database);
    const contents = new Map(result.rows.map(row => [row.id, row]));
    return references.map(block => {
        const row = contents.get(block.id);
        if (!row) throw new Error('Cambió la versión del bloque durante la lectura. Reintentá.');
        const content = row.content;
        return {...block, commentCount: row.commentCount, content: block.typeId === "imagen" ? JSON.stringify(parseImageBlock(content)) : block.typeId === "visualizacion" ? JSON.stringify(parseVisualizationBlock(content)) : block.typeId === "documento" ? JSON.stringify(parseDocumentBlock(content)) : block.typeId === "dataset" ? JSON.stringify(parseDatasetBlock(content)) : content};
    });
}

export async function topicConvergence(database: Kysely<DB> | Transaction<DB>, topicId: string): Promise<TopicEditableBlock[]> {
    return loadConvergedBlocks(database, await topicConvergenceReferences(database, topicId));
}

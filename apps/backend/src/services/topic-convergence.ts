import {sql, type Kysely, type Transaction} from 'kysely';
import type {BlockType, TopicEditableBlock} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';
import {compareContentBlocks, parseImageBlock, parseVisualizationBlock, parseDocumentBlock, parseDatasetBlock} from '@cabildo-abierto/utils';
import {documentBlockContent} from './documents/block-content.js';
import {activeRejectCounts, rejectTree, rejectTreeQuery} from './record-reactions.js';

type StoredTopicBlock = {
    id: string;
    editId: string;
    blockNumber: string;
    typeId: BlockType["id"];
    order: string;
    deleted: boolean;
};

function topicBlockVersions(topicId: string, typeId?: "documento" | "dataset", blockNumbers?: string[]) {
    return sql<StoredTopicBlock & {created_at: Date}>`
        SELECT block_version.id,
               block_version.edit_id AS "editId",
               block_version.block_number AS "blockNumber",
               block.type_id AS "typeId",
               block_version.order,
               block_version.deleted,
               record.created_at
        FROM block_version
        INNER JOIN block
            ON block.topic_id = block_version.topic_id
           AND block.block_number = block_version.block_number
        INNER JOIN edit ON edit.id = block_version.edit_id
        INNER JOIN record ON record.id = edit.id
        WHERE block_version.topic_id = ${topicId}
          AND record.deleted = false
          ${typeId ? sql`AND block.type_id = ${typeId}` : sql``}
          ${blockNumbers ? sql`AND block_version.block_number IN (${sql.join(blockNumbers.map(number => sql`${number}`))})` : sql``}
        ORDER BY block_version.block_number, record.created_at DESC, record.id DESC
    `;
}

export async function topicConvergenceReferences(database: Kysely<DB> | Transaction<DB>, topicId: string, typeId?: "documento" | "dataset", blockNumbers?: string[]) {
    if (blockNumbers?.length === 0) return [];
    const blockResult = await topicBlockVersions(topicId,typeId,blockNumbers).execute(database);
    const rejectCounts = activeRejectCounts(await rejectTree(database, [...new Set(blockResult.rows.map(block => block.editId))]));
    const selected = new Map<string, StoredTopicBlock>();
    const latest = new Map<string, StoredTopicBlock>();
    for (const {created_at: _createdAt, ...block} of blockResult.rows) {
        if (!latest.has(block.blockNumber)) latest.set(block.blockNumber, block);
        if (!selected.has(block.blockNumber) && (rejectCounts.get(block.editId) ?? 0) === 0) selected.set(block.blockNumber, block);
    }
    for (const [blockNumber, block] of latest) {
        if (!selected.has(blockNumber)) selected.set(blockNumber, {...block, deleted: true});
    }
    return [...selected.values()].sort(compareContentBlocks).map(({editId: _editId, ...block}) => block);
}

export async function topicConvergencePage(database: Kysely<DB> | Transaction<DB>, topicId: string, typeId: "documento" | "dataset", requestedPage: number, includeDeleted: boolean) {
    const pageSize = 12;
    // Keep the same numeric-aware ordering as topicConvergenceReferences. Only
    // logical block names are read here; version selection stays in PostgreSQL.
    const names = await database.selectFrom('block').select('block_number')
        .where('topic_id','=',topicId).where('type_id','=',typeId).execute();
    const blockNumbers = names.map(row => row.block_number).sort((left,right) =>
        compareContentBlocks({typeId,order:'',blockNumber:left},{typeId,order:'',blockNumber:right}));
    const result = await sql<{references: BlockReference[]; total: number; page: number}>`
        WITH candidates AS (${topicBlockVersions(topicId,typeId)}),
        tree AS (${rejectTreeQuery(sql`SELECT DISTINCT "editId" FROM candidates`)}),
        rejected AS (
            SELECT DISTINCT root."recordId" AS edit_id FROM tree root
            WHERE root.depth = 0 AND NOT EXISTS (
                SELECT 1 FROM tree leaf
                WHERE leaf."rootReactionId" = root."rootReactionId" AND leaf.depth % 2 = 1
                    AND (leaf."reasonId" IS NULL OR NOT EXISTS (
                        SELECT 1 FROM tree child WHERE child."rootReactionId" = root."rootReactionId"
                            AND child."subjectId" = leaf."reasonId"
                    ))
            )
        ), selected AS (
            SELECT DISTINCT ON (c."blockNumber") c.id, c."blockNumber", c."typeId", c."order",
                (c.deleted OR r.edit_id IS NOT NULL) AS deleted
            FROM candidates c LEFT JOIN rejected r ON r.edit_id = c."editId"
            ORDER BY c."blockNumber", (r.edit_id IS NOT NULL), c.created_at DESC, c."editId" DESC
        ), visible AS (SELECT * FROM selected WHERE ${includeDeleted} OR NOT deleted),
        totals AS (SELECT count(*)::int AS total FROM visible),
        pagination AS (
            SELECT total, least(${requestedPage}, greatest(0, (total - 1) / ${pageSize})) AS page FROM totals
        ), ordered AS (
            SELECT visible.*, names.position FROM visible
            JOIN unnest(${blockNumbers}::text[]) WITH ORDINALITY AS names(number,position)
                ON names.number = visible."blockNumber"
        ), page AS (
            SELECT * FROM ordered ORDER BY position
            LIMIT ${pageSize} OFFSET (SELECT page * ${pageSize} FROM pagination)
        )
        SELECT pagination.total, pagination.page,
            coalesce((SELECT json_agg(json_build_object('id',id,'blockNumber',"blockNumber",'typeId',"typeId",
                'order',"order",'deleted',deleted) ORDER BY position) FROM page),'[]'::json) AS "references"
        FROM pagination
    `.execute(database);
    return {...result.rows[0],pageSize};
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

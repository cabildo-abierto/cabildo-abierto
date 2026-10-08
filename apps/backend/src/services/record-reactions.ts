import {sql, type Kysely, type Transaction, type RawBuilder} from "kysely";
import type {DB} from "#/db/types.js";

type RejectTreeRow = {
    id: string;
    recordId: string;
    rootReactionId: string;
    subjectId: string;
    reasonId: string | null;
    depth: number;
};

export function rejectTreeQuery(recordIds: RawBuilder<unknown>) {
    return sql<RejectTreeRow>`
        WITH RECURSIVE reject_tree AS (
            SELECT reaction.id,
                   reaction.subject_id AS "recordId",
                   reaction.id AS "rootReactionId",
                   reaction.subject_id AS "subjectId",
                   reaction.reason_id AS "reasonId",
                   0::int AS depth,
                   ARRAY[reaction.id] AS path
            FROM reaction
            WHERE reaction.type = 'reject'
              AND reaction.subject_id IN (${recordIds})
            UNION ALL
            SELECT child.id,
                   reject_tree."recordId",
                   reject_tree."rootReactionId",
                   child.subject_id,
                   child.reason_id,
                   reject_tree.depth + 1,
                   reject_tree.path || child.id
            FROM reject_tree
            INNER JOIN reaction AS child
                ON child.subject_id = reject_tree."reasonId"
               AND child.type = 'reject'
            WHERE NOT child.id = ANY(reject_tree.path)
        )
        SELECT id, "recordId", "rootReactionId", "subjectId", "reasonId", depth
        FROM reject_tree
    `;
}

export async function rejectTree(database: Kysely<DB> | Transaction<DB>, recordIds: string[]): Promise<RejectTreeRow[]> {
    if (recordIds.length === 0) return [];
    const result = await rejectTreeQuery(sql.join(recordIds.map(id => sql`${id}`))).execute(database);
    return result.rows;
}

export function activeRejectCounts(tree: RejectTreeRow[]): Map<string, number> {
    const rowsByRoot = new Map<string, RejectTreeRow[]>();
    for (const row of tree) {
        const rows = rowsByRoot.get(row.rootReactionId) ?? [];
        rows.push(row);
        rowsByRoot.set(row.rootReactionId, rows);
    }
    const counts = new Map<string, number>();
    for (const rows of rowsByRoot.values()) {
        const root = rows.find(row => row.depth === 0);
        if (!root) continue;
        const subjects = new Set(rows.map(row => row.subjectId));
        const leaves = rows.filter(row => !row.reasonId || !subjects.has(row.reasonId));
        if (leaves.every(leaf => leaf.depth % 2 === 0)) {
            counts.set(root.recordId, (counts.get(root.recordId) ?? 0) + 1);
        }
    }
    return counts;
}

export function visibleRejectCounts(tree: RejectTreeRow[]): {unreplicated: Map<string, number>; replicated: Map<string, number>} {
    const childrenByRoot = new Map<string, number>();
    for (const row of tree) {
        if (row.depth > 0) childrenByRoot.set(row.rootReactionId, (childrenByRoot.get(row.rootReactionId) ?? 0) + 1);
    }
    const unreplicated = new Map<string, number>();
    const replicated = new Map<string, number>();
    for (const row of tree) {
        if (row.depth !== 0) continue;
        const target = childrenByRoot.has(row.rootReactionId) ? replicated : unreplicated;
        target.set(row.recordId, (target.get(row.recordId) ?? 0) + 1);
    }
    return {unreplicated, replicated};
}

export async function deleteReactionTree(database: Transaction<DB>, rootReactionId: string): Promise<void> {
    const result = await sql<{id: string}>`
        WITH RECURSIVE reaction_tree AS (
            SELECT id, reason_id, ARRAY[id] AS path
            FROM reaction
            WHERE id = ${rootReactionId}
            UNION ALL
            SELECT child.id, child.reason_id, reaction_tree.path || child.id
            FROM reaction_tree
            INNER JOIN reaction AS child
                ON child.subject_id = reaction_tree.reason_id
               AND child.type = 'reject'
            WHERE NOT child.id = ANY(reaction_tree.path)
        )
        SELECT id FROM reaction_tree
    `.execute(database);
    const ids = result.rows.map(row => row.id);
    if (ids.length === 0) return;
    await database.deleteFrom("reaction").where("id", "in", ids).execute();
    await database.deleteFrom("record").where("id", "in", ids).execute();
}

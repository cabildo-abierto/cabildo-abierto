import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import {sql, type Kysely, type Transaction} from "kysely";
import type {BlockCommentsOutput, BlockType, CreateBlockCommentInput, CreateBlockCommentOutput, CreateBlockReactionInput, CreateTopicInput, CreateTopicOutput, DeleteBlockReactionInput, SaveTopicEditBlockInput, SaveTopicEditInput, SaveTopicEditOutput, SearchTopicsOutput, TopicBlock, TopicBlocksOutput, TopicBlockVersionsOutput, TopicEditableBlock, TopicEditorDataOutput, TopicOutput} from "@cabildo-abierto/api";
import {claimsRichTextFormat, isOrder, isRichTextEmpty, parseRichTextContent, richTextInternalTopicIds, richTextPlainText} from "@cabildo-abierto/utils";
import type {AppContext} from "#/setup.js";
import type {DB} from "#/db/types.js";
import {currentUser, requireSession, requiredUser, withSession} from "#/auth/middleware.js";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";
import {notifyTopicChanged} from "#/services/topic-connections.js";

const BLOCK_PREFIXES: Record<BlockType["id"], string> = {parrafo: "p", h1: "h1", h2: "h2"};

type StoredTopicBlock = {
    id: string;
    editId: string;
    blockNumber: string;
    typeId: BlockType["id"];
    content: string;
    order: string;
    commentCount: number;
    deleted: boolean;
};

async function topicConvergence(database: Kysely<DB> | Transaction<DB>, topicId: string): Promise<TopicEditableBlock[]> {
    const blockResult = await sql<StoredTopicBlock>`
        SELECT block_version.id,
               block_version.edit_id AS "editId",
               block_version.block_number AS "blockNumber",
               block.type_id AS "typeId",
               block_version.content,
               block_version.order,
               block_version.deleted,
               (
                   SELECT COUNT(*)::int
                   FROM comment
                   WHERE comment.topic_id = block_version.topic_id
                     AND comment.block_number = block_version.block_number
                     AND comment.reply_to_id = comment.root_id
               ) AS "commentCount"
        FROM block_version
        INNER JOIN block
            ON block.topic_id = block_version.topic_id
           AND block.block_number = block_version.block_number
        INNER JOIN edit ON edit.id = block_version.edit_id
        INNER JOIN record ON record.id = edit.id
        WHERE block_version.topic_id = ${topicId}
          AND record.deleted = false
        ORDER BY block_version.block_number, record.created_at DESC, record.id DESC
    `.execute(database);
    const rejectCounts = activeRejectCounts(await rejectTree(database, blockResult.rows.map(block => block.editId)));
    const selected = new Map<string, StoredTopicBlock>();
    const latest = new Map<string, StoredTopicBlock>();
    for (const block of blockResult.rows) {
        if (!latest.has(block.blockNumber)) latest.set(block.blockNumber, block);
        if (!selected.has(block.blockNumber) && (rejectCounts.get(block.editId) ?? 0) === 0) selected.set(block.blockNumber, block);
    }
    for (const [blockNumber, block] of latest) {
        if (!selected.has(blockNumber)) selected.set(blockNumber, {...block, deleted: true});
    }
    return [...selected.values()]
        .sort((left, right) => left.order.localeCompare(right.order) || left.blockNumber.localeCompare(right.blockNumber))
        .map(({editId: _editId, ...block}) => block);
}

function databaseCode(error: unknown): string | undefined {
    if (!error || typeof error !== "object" || !("code" in error)) return undefined;
    return typeof error.code === "string" ? error.code : undefined;
}

function sameConvergenceBlocks(left: SaveTopicEditBlockInput[], right: TopicEditableBlock[]): boolean {
    if (left.length !== right.length) return false;
    const rightByNumber = new Map(right.map(block => [block.blockNumber, block]));
    const seen = new Set<string>();
    for (const block of left) {
        if (!block.blockNumber || !block.id || seen.has(block.blockNumber)) return false;
        const current = rightByNumber.get(block.blockNumber);
        if (!current || current.id !== block.id || current.typeId !== block.typeId
            || current.content !== block.content || current.order !== block.order || current.deleted !== block.deleted) {
            return false;
        }
        seen.add(block.blockNumber);
    }
    return seen.size === rightByNumber.size;
}

class TopicEditError extends Error {
    constructor(readonly status: 400 | 403 | 404 | 409, message: string) {
        super(message);
    }
}

type RejectTreeRow = {
    id: string;
    editId: string;
    rootReactionId: string;
    subjectId: string;
    reasonId: string | null;
    depth: number;
};

async function rejectTree(database: Kysely<DB> | Transaction<DB>, editIds: string[]): Promise<RejectTreeRow[]> {
    if (editIds.length === 0) return [];
    const result = await sql<RejectTreeRow>`
        WITH RECURSIVE reject_tree AS (
            SELECT reaction.id,
                   reaction.subject_id AS "editId",
                   reaction.id AS "rootReactionId",
                   reaction.subject_id AS "subjectId",
                   reaction.reason_id AS "reasonId",
                   0::int AS depth,
                   ARRAY[reaction.id] AS path
            FROM reaction
            WHERE reaction.type = 'reject'
              AND reaction.subject_id IN (${sql.join(editIds.map(id => sql`${id}`))})
            UNION ALL
            SELECT child.id,
                   reject_tree."editId",
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
        SELECT id, "editId", "rootReactionId", "subjectId", "reasonId", depth
        FROM reject_tree
    `.execute(database);
    return result.rows;
}

function activeRejectCounts(tree: RejectTreeRow[]): Map<string, number> {
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
            counts.set(root.editId, (counts.get(root.editId) ?? 0) + 1);
        }
    }
    return counts;
}

function visibleRejectCounts(tree: RejectTreeRow[]): {unreplicated: Map<string, number>; replicated: Map<string, number>} {
    const childrenByRoot = new Map<string, number>();
    for (const row of tree) {
        if (row.depth > 0) childrenByRoot.set(row.rootReactionId, (childrenByRoot.get(row.rootReactionId) ?? 0) + 1);
    }
    const unreplicated = new Map<string, number>();
    const replicated = new Map<string, number>();
    for (const row of tree) {
        if (row.depth !== 0) continue;
        const target = childrenByRoot.has(row.rootReactionId) ? replicated : unreplicated;
        target.set(row.editId, (target.get(row.editId) ?? 0) + 1);
    }
    return {unreplicated, replicated};
}

async function deleteReactionTree(database: Transaction<DB>, rootReactionId: string): Promise<void> {
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

function blockContent(input: Partial<SaveTopicEditBlockInput>): {typeId: BlockType["id"]; content: string} | null {
    if (input.typeId !== "parrafo" && input.typeId !== "h1" && input.typeId !== "h2") return null;
    if (typeof input.content !== "string") return null;
    const content = input.typeId === "parrafo" ? input.content : input.content.trim();
    if (input.deleted === true && content === "") return {typeId: input.typeId, content};
    if (input.typeId === "parrafo") {
        if (claimsRichTextFormat(content) && !parseRichTextContent(content)) return null;
        if (isRichTextEmpty(content) || richTextPlainText(content).length > 20_000 || content.length > 100_000) return null;
    } else if (!content || content.length > 20_000) return null;
    if (input.typeId !== "parrafo" && /[\r\n]/.test(content)) return null;
    return {typeId: input.typeId, content};
}

export const topicRoutes = (ctx: AppContext): Router => {
    const router = express.Router();

    router.get("/topics", async (req, res) => {
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

        try {
            const result = await sql<{id: string; title: string}>`
                WITH topic_activity AS (
                    SELECT edit.topic_id, record.author_id, record.created_at
                    FROM edit
                    INNER JOIN record ON record.id = edit.id

                    UNION ALL

                    SELECT comment.topic_id, record.author_id, record.created_at
                    FROM comment
                    INNER JOIN record ON record.id = comment.id

                    UNION ALL

                    SELECT COALESCE(reason.topic_id, subject_edit.topic_id) AS topic_id,
                           record.author_id,
                           record.created_at
                    FROM reaction
                    INNER JOIN record ON record.id = reaction.id
                    LEFT JOIN comment AS reason ON reason.id = reaction.reason_id
                    LEFT JOIN edit AS subject_edit ON subject_edit.id = reaction.subject_id
                    WHERE reason.topic_id IS NOT NULL OR subject_edit.topic_id IS NOT NULL
                )
                SELECT topic.id, topic.title
                FROM topic
                LEFT JOIN topic_activity ON topic_activity.topic_id = topic.id
                WHERE (${search} = '' OR topic.title ILIKE ${`%${search}%`})
                GROUP BY topic.id, topic.title
                ORDER BY COUNT(DISTINCT topic_activity.author_id)
                             FILTER (WHERE topic_activity.created_at >= NOW() - INTERVAL '7 days') DESC,
                         COUNT(topic_activity.author_id) DESC,
                         MIN(topic_activity.created_at) DESC NULLS FIRST,
                         topic.title ASC
            `.execute(ctx.kysely);
            const topics = result.rows;
            const value: SearchTopicsOutput = {topics};
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic search failed");
            return res.status(500).json({success: false, error: "No pudimos buscar los temas."});
        }
    });

    router.get("/topics/:id", async (req, res) => {
        try {
            const topic = await ctx.kysely
                .selectFrom("topic")
                .select(["id", "title"])
                .where("id", "=", req.params.id)
                .executeTakeFirst();
            if (!topic) return res.status(404).json({success: false, error: "No encontramos ese tema."});
            const value: TopicOutput = {topic};
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar el tema."});
        }
    });

    router.get("/topics/:id/blocks", async (req, res) => {
        try {
            const [convergence, blockTypes] = await Promise.all([
                topicConvergence(ctx.kysely, req.params.id),
                ctx.kysely.selectFrom("block_type")
                    .select(["id", "name"])
                    .where("id", "in", ["parrafo", "h1", "h2"])
                    .orderBy("id", "asc")
                    .execute(),
            ]);
            const value: TopicBlocksOutput = {
                blocks: convergence.filter(block => !block.deleted).map(({deleted: _deleted, ...block}) => block),
                deletedBlocks: convergence.filter(block => block.deleted).map(({deleted: _deleted, ...block}) => block),
                blockTypes: blockTypes as BlockType[],
            };
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic blocks lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar los bloques."});
        }
    });

    router.get("/topics/:id/editor-data", requireSession(ctx), async (req, res) => {
        try {
            const [blocks, blockTypes] = await Promise.all([
                topicConvergence(ctx.kysely, req.params.id),
                ctx.kysely.selectFrom("block_type")
                    .select(["id", "name"])
                    .where("id", "in", ["parrafo", "h1", "h2"])
                    .orderBy("id", "asc")
                    .execute(),
            ]);
            const value: TopicEditorDataOutput = {blocks, blockTypes: blockTypes as BlockType[]};
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic editor data lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar los bloques para editar."});
        }
    });

    router.get("/topics/:id/blocks/:blockNumber/versions", withSession(ctx), async (req, res) => {
        try {
            const versions = await ctx.kysely.selectFrom("block_version")
                .innerJoin("block", join => join
                    .onRef("block.topic_id", "=", "block_version.topic_id")
                    .onRef("block.block_number", "=", "block_version.block_number"))
                .innerJoin("edit", "edit.id", "block_version.edit_id")
                .innerJoin("record", "record.id", "edit.id")
                .innerJoin("user", "user.id", "record.author_id")
                .select([
                    "block_version.id",
                    "block_version.block_number as blockNumber",
                    "block.type_id as typeId",
                    "block_version.content",
                    "block_version.deleted",
                    "block_version.order",
                    "edit.id as editId",
                    "edit.message",
                    "record.created_at as createdAt",
                    "user.id as authorId",
                    "user.username as authorUsername",
                    sql<number>`(
                        SELECT COUNT(*)::int
                        FROM comment
                        WHERE comment.root_id = block_version.edit_id
                          AND comment.block_number = block_version.block_number
                          AND comment.reply_to_id = comment.root_id
                    )`.as("commentCount"),
                    sql<number>`(
                        SELECT COUNT(*)::int FROM reaction
                        WHERE reaction.subject_id = edit.id AND reaction.type = 'accept'
                    )`.as("acceptCount"),
                    sql<string | null>`(
                        SELECT reaction.type
                        FROM reaction
                        INNER JOIN record AS reaction_record ON reaction_record.id = reaction.id
                        WHERE reaction.subject_id = edit.id
                          AND reaction_record.author_id = ${currentUser(req)?.id ?? null}
                        LIMIT 1
                    )`.as("userReaction"),
                ])
                .where("block_version.topic_id", "=", req.params.id)
                .where("block_version.block_number", "=", req.params.blockNumber)
                .where("record.deleted", "=", false)
                .orderBy("record.created_at", "desc")
                .orderBy("record.id", "desc")
                .execute();

            if (versions.length === 0) {
                return res.status(404).json({success: false, error: "No encontramos ese bloque."});
            }

            const rejectionTree = await rejectTree(ctx.kysely, versions.map(version => version.editId));
            const activeRejections = activeRejectCounts(rejectionTree);
            const visibleRejects = visibleRejectCounts(rejectionTree);
            const currentIndex = versions.findIndex(version => (activeRejections.get(version.editId) ?? 0) === 0);
            const value: TopicBlockVersionsOutput = {
                versions: versions.map((version, index) => ({
                    id: version.id,
                    blockNumber: version.blockNumber,
                    typeId: version.typeId as BlockType["id"],
                    content: version.content ?? "",
                    order: version.order,
                    editId: version.editId,
                    deleted: version.deleted,
                    message: version.message,
                    rejected: (activeRejections.get(version.editId) ?? 0) > 0,
                    current: index === currentIndex,
                    acceptCount: Number(version.acceptCount),
                    rejectCount: visibleRejects.unreplicated.get(version.editId) ?? 0,
                    replicatedRejectCount: visibleRejects.replicated.get(version.editId) ?? 0,
                    userReaction: version.userReaction === "accept" || version.userReaction === "reject" ? version.userReaction : null,
                    createdAt: version.createdAt.toISOString(),
                    author: {id: version.authorId, username: version.authorUsername},
                    commentCount: Number(version.commentCount),
                })),
            };
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block versions lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar el historial del bloque."});
        }
    });

    router.get("/topics/:id/blocks/:blockNumber/comments", async (req, res) => {
        try {
            const blockExists = await ctx.kysely.selectFrom("block")
                .select("block_number")
                .where("topic_id", "=", req.params.id)
                .where("block_number", "=", req.params.blockNumber)
                .executeTakeFirst();
            if (!blockExists) return res.status(404).json({success: false, error: "No encontramos ese bloque."});

            const comments = await ctx.kysely.selectFrom("comment")
                .innerJoin("block_version", join => join
                    .onRef("block_version.edit_id", "=", "comment.root_id")
                    .onRef("block_version.topic_id", "=", "comment.topic_id")
                    .onRef("block_version.block_number", "=", "comment.block_number"))
                .innerJoin("edit as root_edit", "root_edit.id", "block_version.edit_id")
                .innerJoin("record as root_record", "root_record.id", "root_edit.id")
                .innerJoin("record", "record.id", "comment.id")
                .innerJoin("user", "user.id", "record.author_id")
                .select([
                    "comment.id",
                    "comment.comment_number as commentNumber",
                    "comment.root_id as commentRootId",
                    "block_version.id as blockVersionId",
                    "block_version.id as rootId",
                    sql<string>`CASE
                        WHEN comment.reply_to_id = comment.root_id THEN block_version.id
                        ELSE comment.reply_to_id
                    END`.as("replyToId"),
                    "record.deleted",
                    "comment.content",
                    "record.created_at as createdAt",
                    "user.id as authorId",
                    "user.username as authorUsername",
                    sql<number>`(
                        SELECT count(*)::int FROM comment AS reply
                        WHERE reply.reply_to_id = comment.id
                    )`.as("directReplyCount"),
                    sql<string | null>`(
                        SELECT reaction.subject_id
                        FROM reaction
                        WHERE reaction.reason_id = comment.id
                          AND reaction.type = 'reject'
                        LIMIT 1
                    )`.as("reactionSubjectId"),
                ])
                .where("comment.topic_id", "=", req.params.id)
                .where("comment.block_number", "=", req.params.blockNumber)
                .where("root_record.deleted", "=", false)
                .orderBy("record.created_at", "desc")
                .orderBy("record.id", "desc")
                .execute();
            const commentsById = new Map(comments.map(comment => [comment.id, comment]));
            const depths = new Map<string, number | null>();
            const replicaDepth = (commentId: string, visiting = new Set<string>()): number | null => {
                if (depths.has(commentId)) return depths.get(commentId) ?? null;
                const comment = commentsById.get(commentId);
                if (!comment?.reactionSubjectId || visiting.has(commentId)) return null;
                if (comment.reactionSubjectId === comment.commentRootId) {
                    depths.set(commentId, 0);
                    return 0;
                }
                const parentDepth = replicaDepth(comment.reactionSubjectId, new Set([...visiting, commentId]));
                const depth = parentDepth === null ? null : parentDepth + 1;
                depths.set(commentId, depth);
                return depth;
            };
            const value: BlockCommentsOutput = {comments: comments.map(comment => {
                const depth = replicaDepth(comment.id);
                return {
                id: comment.id,
                commentNumber: comment.commentNumber,
                blockVersionId: comment.blockVersionId,
                rootId: comment.rootId,
                replyToId: comment.replyToId,
                directReplyCount: comment.directReplyCount,
                rejection: depth !== null,
                suggestedVote: depth === null ? null : depth % 2 === 0 ? "reject" : "accept",
                replicaDepth: depth,
                deleted: comment.deleted,
                content: comment.content,
                createdAt: comment.createdAt.toISOString(),
                author: {id: comment.authorId, username: comment.authorUsername},
            };})};
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block comments lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar los comentarios."});
        }
    });

    router.delete("/topics/:id/blocks/:blockNumber/versions/:versionId", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        try {
            await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${req.params.id}:edit`}))`.execute(trx);
                const version = await trx.selectFrom("block_version")
                    .innerJoin("edit", "edit.id", "block_version.edit_id")
                    .innerJoin("record", "record.id", "edit.id")
                    .select(["edit.id as editId", "record.author_id as authorId", "record.deleted"])
                    .where("block_version.id", "=", req.params.versionId)
                    .where("block_version.topic_id", "=", req.params.id)
                    .where("block_version.block_number", "=", req.params.blockNumber)
                    .where("record.deleted", "=", false)
                    .executeTakeFirst();
                if (!version || version.deleted) throw new TopicEditError(404, "No encontramos esa versión.");
                if (version.authorId !== user.id) throw new TopicEditError(403, "Solo el autor puede eliminar esta edición.");
                await trx.updateTable("record").set({deleted: true}).where("id", "=", version.editId).execute();
            });
            await notifyTopicChanged(ctx.kysely, req.params.id, "edit", ctx.logger);
            return res.json({success: true});
        } catch (error) {
            if (error instanceof TopicEditError) return res.status(error.status).json({success: false, error: error.message});
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic edit deletion failed");
            return res.status(500).json({success: false, error: "No pudimos eliminar la edición."});
        }
    });

    router.post("/topics/:id/blocks/:blockNumber/versions/:versionId/reactions", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const input = (req.body ?? {}) as Partial<CreateBlockReactionInput>;
        if (input.type !== "accept") return res.status(400).json({success: false, error: "La reacción no es válida."});
        try {
            const version = await ctx.kysely.selectFrom("block_version")
                .innerJoin("edit", "edit.id", "block_version.edit_id")
                .innerJoin("record", "record.id", "edit.id")
                .select(["block_version.edit_id as editId", "record.author_id as authorId"])
                .where("block_version.id", "=", req.params.versionId)
                .where("block_version.topic_id", "=", req.params.id)
                .where("block_version.block_number", "=", req.params.blockNumber)
                .where("record.deleted", "=", false)
                .executeTakeFirst();
            if (!version) return res.status(404).json({success: false, error: "No encontramos esa versión del bloque."});
            if (version.authorId === user.id) return res.status(403).json({success: false, error: "No podés votar tu propia edición."});
            await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${version.editId}:reaction`}))`.execute(trx);
                const existing = await trx.selectFrom("reaction")
                    .innerJoin("record", "record.id", "reaction.id")
                    .select("reaction.id")
                    .where("reaction.subject_id", "=", version.editId)
                    .where("record.author_id", "=", user.id)
                    .executeTakeFirst();
                if (existing) throw new TopicEditError(409, "Ya votaste esta edición.");
                const reactionId = randomUUID();
                await trx.insertInto("record").values({id: reactionId, type_id: "reaction", author_id: user.id}).execute();
                await trx.insertInto("reaction").values({id: reactionId, type: "accept", subject_id: version.editId, reason_id: null}).execute();
            });
            await notifyTopicChanged(ctx.kysely, req.params.id, "vote", ctx.logger);
            return res.status(201).json({success: true});
        } catch (error) {
            if (error instanceof TopicEditError) return res.status(error.status).json({success: false, error: error.message});
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block version reaction failed");
            return res.status(500).json({success: false, error: "No pudimos registrar el voto."});
        }
    });

    router.delete("/topics/:id/blocks/:blockNumber/versions/:versionId/reactions", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const input = (req.body ?? {}) as DeleteBlockReactionInput;
        try {
            const version = await ctx.kysely.selectFrom("block_version")
                .select("edit_id as editId")
                .where("id", "=", req.params.versionId)
                .where("topic_id", "=", req.params.id)
                .where("block_number", "=", req.params.blockNumber)
                .executeTakeFirst();
            if (!version) return res.status(404).json({success: false, error: "No encontramos esa versión del bloque."});
            await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${version.editId}:reaction`}))`.execute(trx);
                const reaction = await trx.selectFrom("reaction")
                    .innerJoin("record", "record.id", "reaction.id")
                    .select(["reaction.id", "reaction.type", "reaction.reason_id as reasonId", "record.author_id as authorId"])
                    .where("reaction.subject_id", "=", version.editId)
                    .where("record.author_id", "=", user.id)
                    .executeTakeFirst();
                if (!reaction) throw new TopicEditError(404, "No encontramos tu voto a esta edición.");
                if (reaction.type === "reject" && input.deleteReason === true && reaction.reasonId) {
                    await trx.updateTable("record").set({deleted: true}).where("id", "=", reaction.reasonId).execute();
                }
                await deleteReactionTree(trx, reaction.id);
            });
            await notifyTopicChanged(ctx.kysely, req.params.id, "vote", ctx.logger);
            return res.json({success: true});
        } catch (error) {
            if (error instanceof TopicEditError) return res.status(error.status).json({success: false, error: error.message});
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block version reaction cancellation failed");
            return res.status(500).json({success: false, error: "No pudimos cancelar el voto."});
        }
    });

    router.delete("/topics/:id/blocks/:blockNumber/comments/:commentId", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        try {
            const comment = await ctx.kysely.selectFrom("comment")
                .innerJoin("record", "record.id", "comment.id")
                .select(["comment.id", "comment.root_id as rootId", "record.author_id"])
                .where("comment.id", "=", req.params.commentId)
                .where("comment.topic_id", "=", req.params.id)
                .where("comment.block_number", "=", req.params.blockNumber)
                .executeTakeFirst();
            if (!comment) return res.status(404).json({success: false, error: "No encontramos ese comentario."});
            if (comment.author_id !== user.id) return res.status(403).json({success: false, error: "Solo el autor puede eliminar este comentario."});
            const removedVote = await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${comment.rootId}:reaction`}))`.execute(trx);
                const rejection = await trx.selectFrom("reaction")
                    .select("id")
                    .where("reason_id", "=", comment.id)
                    .where("type", "=", "reject")
                    .executeTakeFirst();
                if (rejection) {
                    await deleteReactionTree(trx, rejection.id);
                }
                await trx.updateTable("record")
                    .set({deleted: true})
                    .where("id", "=", comment.id)
                    .execute();
                return Boolean(rejection);
            });
            await notifyTopicChanged(ctx.kysely, req.params.id, removedVote ? "vote" : "comment", ctx.logger);
            return res.json({success: true});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block comment deletion failed");
            return res.status(500).json({success: false, error: "No pudimos eliminar el comentario."});
        }
    });

    router.post("/topics/:id/blocks/:blockNumber/comments", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        const blockNumber = req.params.blockNumber;
        if (typeof topicId !== "string" || typeof blockNumber !== "string") {
            return res.status(400).json({success: false, error: "El tema o bloque no es válido."});
        }
        const input = (req.body ?? {}) as Partial<CreateBlockCommentInput>;
        const content = typeof input.content === "string" ? input.content.trim() : "";
        if (typeof input.blockVersionId !== "string" || !content || content.length > 20_000
            || (input.reject !== undefined && typeof input.reject !== "boolean")
            || (input.replica !== undefined && typeof input.replica !== "boolean")
            || (input.reject === true && input.replica === true)
            || (input.replica === true && typeof input.replyToId !== "string")) {
            return res.status(400).json({success: false, error: "Ingresá un comentario válido."});
        }
        const reject = input.reject === true;
        const replica = input.replica === true;
        try {
            const version = await ctx.kysely.selectFrom("block_version")
                .innerJoin("edit", "edit.id", "block_version.edit_id")
                .innerJoin("record", "record.id", "edit.id")
                .select(["block_version.id", "block_version.edit_id as editId", "record.author_id as authorId"])
                .where("block_version.id", "=", input.blockVersionId)
                .where("block_version.topic_id", "=", topicId)
                .where("block_version.block_number", "=", blockNumber)
                .where("record.deleted", "=", false)
                .executeTakeFirst();
            if (!version) return res.status(404).json({success: false, error: "No encontramos esa versión del bloque."});
            if (reject && version.authorId === user.id) return res.status(403).json({success: false, error: "No podés rechazar tu propia edición."});

            let replyToId = version.editId;
            let replicaDepth: number | null = null;
            if (input.replyToId) {
                const parentDepth = await sql<{depth: number}>`
                    WITH RECURSIVE ancestors AS (
                        SELECT id, reply_to_id, 1::int AS depth
                        FROM comment
                        WHERE id = ${input.replyToId}
                          AND topic_id = ${topicId}
                          AND root_id = ${version.editId}
                          AND block_number = ${blockNumber}
                        UNION ALL
                        SELECT comment.id, comment.reply_to_id, ancestors.depth + 1
                        FROM comment
                        INNER JOIN ancestors ON ancestors.reply_to_id = comment.id
                    )
                    SELECT max(depth)::int AS depth FROM ancestors
                `.execute(ctx.kysely);
                const depth = parentDepth.rows[0]?.depth;
                if (!depth) return res.status(404).json({success: false, error: "No encontramos ese comentario."});
                replyToId = input.replyToId;
                if (replica) {
                    const target = await ctx.kysely.selectFrom("comment")
                        .innerJoin("record", "record.id", "comment.id")
                        .innerJoin("reaction", join => join
                            .onRef("reaction.reason_id", "=", "comment.id")
                            .on("reaction.type", "=", "reject"))
                        .select(["comment.id", "record.author_id as authorId"])
                        .where("comment.id", "=", input.replyToId)
                        .where("comment.topic_id", "=", topicId)
                        .where("comment.block_number", "=", blockNumber)
                        .where("comment.root_id", "=", version.editId)
                        .executeTakeFirst();
                    if (!target) return res.status(400).json({success: false, error: "Solo se pueden replicar rechazos o réplicas."});
                    if (target.authorId === user.id) return res.status(403).json({success: false, error: "No podés replicar tu propio voto."});
                    replicaDepth = depth;
                }
            }

            const created = await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:comment`}))`.execute(trx);
                if (reject || replica) {
                    await sql`select pg_advisory_xact_lock(hashtext(${`${version.editId}:reaction`}))`.execute(trx);
                }
                if (reject) {
                    const existingReaction = await trx.selectFrom("reaction")
                        .innerJoin("record", "record.id", "reaction.id")
                        .select(["reaction.id", "reaction.type"])
                        .where("reaction.subject_id", "=", version.editId)
                        .where("record.author_id", "=", user.id)
                        .executeTakeFirst();
                    if (existingReaction?.type === "reject") throw new TopicEditError(409, "Ya votaste esta edición.");
                    if (existingReaction) {
                        await trx.deleteFrom("reaction").where("id", "=", existingReaction.id).execute();
                        await trx.deleteFrom("record").where("id", "=", existingReaction.id).execute();
                    }
                }
                if (replica) {
                    const targetReaction = await trx.selectFrom("reaction")
                        .select("id")
                        .where("reason_id", "=", replyToId)
                        .where("type", "=", "reject")
                        .executeTakeFirst();
                    if (!targetReaction) throw new TopicEditError(409, "El voto que querías replicar ya no está disponible.");
                    const existingReplica = await trx.selectFrom("reaction")
                        .innerJoin("record", "record.id", "reaction.id")
                        .select("reaction.id")
                        .where("reaction.subject_id", "=", replyToId)
                        .where("reaction.type", "=", "reject")
                        .where("record.author_id", "=", user.id)
                        .executeTakeFirst();
                    if (existingReplica) throw new TopicEditError(409, "Ya replicaste este voto.");
                }
                const existing = await trx.selectFrom("comment")
                    .select("comment_number")
                    .where("topic_id", "=", topicId)
                    .where("comment_number", "like", "c-%")
                    .execute();
                const number = existing.reduce((max, item) => {
                    const value = Number(item.comment_number.slice(2));
                    return Number.isInteger(value) ? Math.max(max, value) : max;
                }, 0) + 1;
                const id = randomUUID();
                await trx.insertInto("record").values({id, type_id: "comment", author_id: user.id}).execute();
                await trx.insertInto("comment").values({
                    id,
                    topic_id: topicId,
                    comment_number: `c-${number}`,
                    root_id: version.editId,
                    reply_to_id: replyToId,
                    content,
                    block_number: blockNumber,
                }).execute();
                if (reject || replica) {
                    const reactionId = randomUUID();
                    await trx.insertInto("record").values({id: reactionId, type_id: "reaction", author_id: user.id}).execute();
                    await trx.insertInto("reaction").values({id: reactionId, type: "reject", subject_id: replica ? replyToId : version.editId, reason_id: id}).execute();
                }
                const record = await trx.selectFrom("record").select("created_at").where("id", "=", id).executeTakeFirstOrThrow();
                return {
                    id,
                    commentNumber: `c-${number}`,
                    blockVersionId: version.id,
                    rootId: version.id,
                    replyToId: input.replyToId ?? version.id,
                    directReplyCount: 0,
                    rejection: reject || replica,
                    suggestedVote: reject ? "reject" as const : replicaDepth === null ? null : replicaDepth % 2 === 0 ? "reject" as const : "accept" as const,
                    replicaDepth: reject ? 0 : replicaDepth,
                    deleted: false,
                    content,
                    createdAt: record.created_at.toISOString(),
                    author: user,
                };
            });
            await notifyTopicChanged(ctx.kysely, topicId, reject || replica ? "vote" : "comment", ctx.logger);
            const value: CreateBlockCommentOutput = {comment: created};
            return res.status(201).json({success: true, value});
        } catch (error) {
            if (error instanceof TopicEditError) return res.status(error.status).json({success: false, error: error.message});
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block comment creation failed");
            return res.status(500).json({success: false, error: "No pudimos publicar el comentario."});
        }
    });

    router.post("/topics/:id/edits", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        const input = (req.body ?? {}) as Partial<SaveTopicEditInput>;
        if (typeof topicId !== "string" || !Array.isArray(input.blocks) || input.blocks.length === 0) {
            return res.status(400).json({success: false, error: "La edición no es válida."});
        }
        const parsedBlocks = input.blocks.map(block => {
            if (!block || typeof block !== "object") return null;
            const parsed = blockContent(block);
            const existing = typeof block.id === "string" && typeof block.blockNumber === "string";
            const newBlock = block.id === null && block.blockNumber === null;
            if (!parsed || (!existing && !newBlock) || !isOrder(block.order)
                || typeof block.deleted !== "boolean" || (newBlock && block.deleted)) return null;
            return {...block, ...parsed};
        });
        if (parsedBlocks.some(block => block === null)) {
            return res.status(400).json({success: false, error: "La edición contiene bloques inválidos."});
        }
        const requestedBlocks = parsedBlocks as SaveTopicEditInput["blocks"];
        const baseBlocks = input.baseBlocks;
        if (baseBlocks !== undefined && (!Array.isArray(baseBlocks) || baseBlocks.some(block => {
            if (!block || typeof block !== "object") return true;
            const parsed = blockContent(block);
            return !parsed || typeof block.id !== "string" || typeof block.blockNumber !== "string"
                || !isOrder(block.order) || typeof block.deleted !== "boolean";
        }))) {
            return res.status(400).json({success: false, error: "La convergencia base no es válida."});
        }
        const visibleRequestedBlocks = requestedBlocks.filter(block => !block.deleted);
        if (visibleRequestedBlocks.some((block, index) => index > 0 && visibleRequestedBlocks[index - 1].order >= block.order)) {
            return res.status(400).json({success: false, error: "El orden de los bloques no es válido."});
        }

        try {
            const blocks = await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:edit`}))`.execute(trx);
                const linkedTopicIds = [...new Set(visibleRequestedBlocks.flatMap(block => block.typeId === "parrafo"
                    ? richTextInternalTopicIds(block.content)
                    : []))];
                if (linkedTopicIds.length > 0) {
                    const existingTopics = await trx.selectFrom("topic").select("id").where("id", "in", linkedTopicIds).execute();
                    if (existingTopics.length !== linkedTopicIds.length) {
                        throw new TopicEditError(400, "La edición contiene links a temas inexistentes.");
                    }
                }
                const currentBlocks = await topicConvergence(trx, topicId);
                if (baseBlocks && !sameConvergenceBlocks(baseBlocks, currentBlocks)) {
                    throw new TopicEditError(409, "La convergencia cambió. Actualizala antes de guardar.");
                }
                const currentByNumber = new Map(currentBlocks.map(block => [block.blockNumber, block]));
                const existingInputs = requestedBlocks.filter(block => block.blockNumber !== null);
                const submittedNumbers = existingInputs.map(block => block.blockNumber!);
                if (submittedNumbers.length !== currentBlocks.length
                    || new Set(submittedNumbers).size !== submittedNumbers.length
                    || submittedNumbers.some(blockNumber => !currentByNumber.has(blockNumber))) {
                    throw new TopicEditError(409, "La convergencia cambió. Actualizala antes de guardar.");
                }
                for (const block of existingInputs) {
                    const current = currentByNumber.get(block.blockNumber!)!;
                    if (block.id !== current.id) {
                        throw new TopicEditError(409, "La convergencia cambió. Actualizala antes de guardar.");
                    }
                    if (block.typeId !== current.typeId) {
                        throw new TopicEditError(400, "No se puede cambiar el tipo de un bloque existente.");
                    }
                }

                const changedExisting = existingInputs.filter(block => {
                    const current = currentByNumber.get(block.blockNumber!)!;
                    return block.deleted !== current.deleted || block.content !== current.content || block.order !== current.order;
                });
                const newInputs = requestedBlocks.filter(block => block.blockNumber === null);
                if (changedExisting.length === 0 && newInputs.length === 0) {
                    throw new TopicEditError(400, "La edición no contiene cambios.");
                }
                const changedBlockCount = changedExisting.length + newInputs.length;
                const message = typeof input.message === "string" ? input.message.trim() : null;
                if (changedBlockCount > 1 && !message) {
                    throw new TopicEditError(400, "Ingresá un mensaje para la edición multibloque.");
                }
                if (message && message.length > 500) {
                    throw new TopicEditError(400, "El mensaje de edición no puede superar los 500 caracteres.");
                }

                const editId = randomUUID();
                await trx.insertInto("record").values({id: editId, type_id: "edit", author_id: user.id}).execute();
                await trx.insertInto("edit").values({id: editId, topic_id: topicId, message: changedBlockCount > 1 ? message : null}).execute();

                const nextNumberByType = new Map<BlockType["id"], number>();
                for (const typeId of ["parrafo", "h1", "h2"] as const) {
                    if (!newInputs.some(block => block.typeId === typeId)) continue;
                    const prefix = BLOCK_PREFIXES[typeId];
                    await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:${prefix}`}))`.execute(trx);
                    const existing = await trx.selectFrom("block")
                        .select("block_number")
                        .where("topic_id", "=", topicId)
                        .where("block_number", "like", `${prefix}-%`)
                        .execute();
                    const max = existing.reduce((currentMax, item) => {
                        const value = Number(item.block_number.slice(prefix.length + 1));
                        return Number.isInteger(value) ? Math.max(currentMax, value) : currentMax;
                    }, 0);
                    nextNumberByType.set(typeId, max + 1);
                }

                const versions: Array<{
                    id: string
                    topic_id: string
                    block_number: string
                    content: string
                    order: string
                    edit_id: string
                    deleted: boolean
                }> = [];
                for (const block of requestedBlocks) {
                    let blockNumber = block.blockNumber;
                    if (blockNumber === null) {
                        const nextNumber = nextNumberByType.get(block.typeId)!;
                        nextNumberByType.set(block.typeId, nextNumber + 1);
                        blockNumber = `${BLOCK_PREFIXES[block.typeId]}-${nextNumber}`;
                        await trx.insertInto("block").values({
                            topic_id: topicId,
                            block_number: blockNumber,
                            type_id: block.typeId,
                        }).execute();
                    } else if (!changedExisting.some(changed => changed.blockNumber === blockNumber)) {
                        continue;
                    }
                    versions.push({
                        id: randomUUID(),
                        topic_id: topicId,
                        block_number: blockNumber,
                        content: block.deleted ? "" : block.content,
                        order: block.order,
                        edit_id: editId,
                        deleted: block.deleted,
                    });
                }
                await trx.insertInto("block_version").values(versions).execute();
                return topicConvergence(trx, topicId);
            });
            await notifyTopicChanged(ctx.kysely, topicId, "edit", ctx.logger);
            const value: SaveTopicEditOutput = {blocks};
            return res.status(201).json({success: true, value});
        } catch (error) {
            if (error instanceof TopicEditError) {
                return res.status(error.status).json({success: false, error: error.message});
            }
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic edit creation failed");
            return res.status(500).json({success: false, error: "No pudimos guardar la edición."});
        }
    });

    router.post("/topics", async (req, res) => {
        const input = (req.body ?? {}) as Partial<CreateTopicInput>;
        const title = typeof input.title === "string" ? input.title.trim() : "";
        const id = canonicalizeTopicId(title);

        if (title.length < 3 || title.length > 120) {
            return res.status(400).json({success: false, error: "El título debe tener entre 3 y 120 caracteres."});
        }
        if (!id) {
            return res.status(400).json({success: false, error: "El título debe incluir al menos una letra o un número."});
        }

        try {
            const topic = await ctx.kysely
                .insertInto("topic")
                .values({id, title})
                .returning(["id", "title"])
                .executeTakeFirstOrThrow();
            const value: CreateTopicOutput = {topic};
            return res.status(201).json({success: true, value});
        } catch (error) {
            if (databaseCode(error) === "23505") {
                return res.status(409).json({success: false, error: "Ya existe un tema con ese identificador."});
            }
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic creation failed");
            return res.status(500).json({success: false, error: "No pudimos crear el tema."});
        }
    });

    return router;
};

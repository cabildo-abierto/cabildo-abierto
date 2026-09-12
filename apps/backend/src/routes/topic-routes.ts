import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import {sql, type Kysely, type Transaction} from "kysely";
import type {BlockCommentsOutput, BlockType, CreateBlockCommentInput, CreateBlockCommentOutput, CreateBlockReactionInput, CreateTopicInput, CreateTopicOutput, DeleteBlockReactionInput, SaveTopicEditBlockInput, SaveTopicEditInput, SaveTopicEditOutput, SearchTopicsOutput, TopicBlock, TopicBlocksOutput, TopicBlockVersionsOutput, TopicOutput} from "@cabildo-abierto/api";
import {isOrder} from "@cabildo-abierto/utils";
import type {AppContext} from "#/setup.js";
import type {DB} from "#/db/types.js";
import {currentUser, requireSession, requiredUser, withSession} from "#/auth/middleware.js";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";

const BLOCK_PREFIXES: Record<BlockType["id"], string> = {parrafo: "p", h1: "h1", h2: "h2"};

type StoredTopicBlock = {
    id: string;
    blockNumber: string;
    typeId: BlockType["id"];
    content: string;
    order: string;
    commentCount: number;
};

async function topicBlocks(database: Kysely<DB> | Transaction<DB>, topicId: string): Promise<TopicBlock[]> {
    const blockResult = await sql<StoredTopicBlock>`
        WITH ranked_versions AS (
            SELECT
                block_version.id,
                block_version.block_number AS "blockNumber",
                block.type_id AS "typeId",
                block_version.content,
                block_version.order,
                block_version.deleted,
                ROW_NUMBER() OVER (
                    PARTITION BY block_version.topic_id, block_version.block_number
                    ORDER BY record.created_at DESC, record.id DESC
                ) AS version_rank,
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
        )
        SELECT id, "blockNumber", "typeId", content, "order", "commentCount"
        FROM ranked_versions
        WHERE version_rank = 1 AND deleted = false
        ORDER BY "order", "blockNumber"
    `.execute(database);
    return blockResult.rows;
}

function databaseCode(error: unknown): string | undefined {
    if (!error || typeof error !== "object" || !("code" in error)) return undefined;
    return typeof error.code === "string" ? error.code : undefined;
}

class TopicEditError extends Error {
    constructor(readonly status: 400 | 409, message: string) {
        super(message);
    }
}

function blockContent(input: Partial<SaveTopicEditBlockInput>): {typeId: BlockType["id"]; content: string} | null {
    if (input.typeId !== "parrafo" && input.typeId !== "h1" && input.typeId !== "h2") return null;
    if (typeof input.content !== "string") return null;
    const content = input.typeId === "parrafo" ? input.content : input.content.trim();
    if (!content.trim() || content.length > 20_000) return null;
    if (input.typeId !== "parrafo" && /[\r\n]/.test(content)) return null;
    return {typeId: input.typeId, content};
}

export const topicRoutes = (ctx: AppContext): Router => {
    const router = express.Router();

    router.get("/topics", async (req, res) => {
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        if (!search) {
            const value: SearchTopicsOutput = {topics: []};
            return res.json({success: true, value});
        }

        try {
            const topics = await ctx.kysely
                .selectFrom("topic")
                .select(["id", "title"])
                .where("title", "ilike", `%${search}%`)
                .orderBy("title", "asc")
                .limit(20)
                .execute();
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
            const [blocks, blockTypes] = await Promise.all([
                topicBlocks(ctx.kysely, req.params.id),
                ctx.kysely.selectFrom("block_type")
                    .select(["id", "name"])
                    .where("id", "in", ["parrafo", "h1", "h2"])
                    .orderBy("id", "asc")
                    .execute(),
            ]);
            const value: TopicBlocksOutput = {
                blocks,
                blockTypes: blockTypes as BlockType[],
            };
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic blocks lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar los bloques."});
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
                    sql<boolean>`EXISTS (
                        SELECT 1 FROM reaction
                        WHERE reaction.subject_id = edit.id
                          AND reaction.type = 'reject'
                    )`.as("rejected"),
                    sql<number>`(
                        SELECT COUNT(*)::int FROM reaction
                        WHERE reaction.subject_id = edit.id AND reaction.type = 'accept'
                    )`.as("acceptCount"),
                    sql<number>`(
                        SELECT COUNT(*)::int FROM reaction
                        WHERE reaction.subject_id = edit.id AND reaction.type = 'reject'
                    )`.as("rejectCount"),
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
                .orderBy("record.created_at", "desc")
                .orderBy("record.id", "desc")
                .execute();

            if (versions.length === 0) {
                return res.status(404).json({success: false, error: "No encontramos ese bloque."});
            }

            const currentIndex = versions.findIndex(version => !version.rejected);
            const value: TopicBlockVersionsOutput = {
                versions: versions.map((version, index) => ({
                    id: version.id,
                    blockNumber: version.blockNumber,
                    typeId: version.typeId as BlockType["id"],
                    content: version.content ?? "",
                    order: version.order,
                    editId: version.editId,
                    message: version.message,
                    rejected: version.rejected,
                    current: index === currentIndex,
                    acceptCount: Number(version.acceptCount),
                    rejectCount: Number(version.rejectCount),
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
                .innerJoin("record", "record.id", "comment.id")
                .innerJoin("user", "user.id", "record.author_id")
                .select([
                    "comment.id",
                    "comment.comment_number as commentNumber",
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
                    sql<boolean>`EXISTS (
                        SELECT 1 FROM reaction
                        WHERE reaction.reason_id = comment.id
                          AND reaction.type = 'reject'
                    )`.as("rejection"),
                ])
                .where("comment.topic_id", "=", req.params.id)
                .where("comment.block_number", "=", req.params.blockNumber)
                .orderBy("record.created_at", "desc")
                .orderBy("record.id", "desc")
                .execute();
            const value: BlockCommentsOutput = {comments: comments.map(comment => ({
                id: comment.id,
                commentNumber: comment.commentNumber,
                blockVersionId: comment.blockVersionId,
                rootId: comment.rootId,
                replyToId: comment.replyToId,
                directReplyCount: comment.directReplyCount,
                rejection: comment.rejection,
                deleted: comment.deleted,
                content: comment.content,
                createdAt: comment.createdAt.toISOString(),
                author: {id: comment.authorId, username: comment.authorUsername},
            }))};
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block comments lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar los comentarios."});
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
                .executeTakeFirst();
            if (!version) return res.status(404).json({success: false, error: "No encontramos esa versión del bloque."});
            if (version.authorId === user.id) return res.status(403).json({success: false, error: "No podés reaccionar a tu propia edición."});
            await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${version.editId}:reaction`}))`.execute(trx);
                const existing = await trx.selectFrom("reaction")
                    .innerJoin("record", "record.id", "reaction.id")
                    .select("reaction.id")
                    .where("reaction.subject_id", "=", version.editId)
                    .where("record.author_id", "=", user.id)
                    .executeTakeFirst();
                if (existing) throw new TopicEditError(409, "Ya reaccionaste a esta edición.");
                const reactionId = randomUUID();
                await trx.insertInto("record").values({id: reactionId, type_id: "reaction", author_id: user.id}).execute();
                await trx.insertInto("reaction").values({id: reactionId, type: "accept", subject_id: version.editId, reason_id: null}).execute();
            });
            return res.status(201).json({success: true});
        } catch (error) {
            if (error instanceof TopicEditError) return res.status(error.status).json({success: false, error: error.message});
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block version reaction failed");
            return res.status(500).json({success: false, error: "No pudimos registrar la reacción."});
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
                if (!reaction) throw new TopicEditError(404, "No encontramos tu reacción a esta edición.");
                if (reaction.type === "reject" && input.deleteReason === true && reaction.reasonId) {
                    await trx.updateTable("record").set({deleted: true}).where("id", "=", reaction.reasonId).execute();
                }
                await trx.deleteFrom("reaction").where("id", "=", reaction.id).execute();
                await trx.deleteFrom("record").where("id", "=", reaction.id).execute();
            });
            return res.json({success: true});
        } catch (error) {
            if (error instanceof TopicEditError) return res.status(error.status).json({success: false, error: error.message});
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block version reaction cancellation failed");
            return res.status(500).json({success: false, error: "No pudimos cancelar la reacción."});
        }
    });

    router.delete("/topics/:id/blocks/:blockNumber/comments/:commentId", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        try {
            const comment = await ctx.kysely.selectFrom("comment")
                .innerJoin("record", "record.id", "comment.id")
                .select(["comment.id", "record.author_id"])
                .where("comment.id", "=", req.params.commentId)
                .where("comment.topic_id", "=", req.params.id)
                .where("comment.block_number", "=", req.params.blockNumber)
                .executeTakeFirst();
            if (!comment) return res.status(404).json({success: false, error: "No encontramos ese comentario."});
            if (comment.author_id !== user.id) return res.status(403).json({success: false, error: "Solo el autor puede eliminar este comentario."});
            await ctx.kysely.transaction().execute(async trx => {
                const rejection = await trx.selectFrom("reaction")
                    .select("id")
                    .where("reason_id", "=", comment.id)
                    .where("type", "=", "reject")
                    .executeTakeFirst();
                if (rejection) {
                    await trx.deleteFrom("reaction").where("id", "=", rejection.id).execute();
                    await trx.deleteFrom("record").where("id", "=", rejection.id).execute();
                }
                await trx.updateTable("record")
                    .set({deleted: true})
                    .where("id", "=", comment.id)
                    .execute();
            });
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
            || (input.reject !== undefined && typeof input.reject !== "boolean")) {
            return res.status(400).json({success: false, error: "Ingresá un comentario válido."});
        }
        const reject = input.reject === true;
        try {
            const version = await ctx.kysely.selectFrom("block_version")
                .innerJoin("edit", "edit.id", "block_version.edit_id")
                .innerJoin("record", "record.id", "edit.id")
                .select(["block_version.id", "block_version.edit_id as editId", "record.author_id as authorId"])
                .where("block_version.id", "=", input.blockVersionId)
                .where("block_version.topic_id", "=", topicId)
                .where("block_version.block_number", "=", blockNumber)
                .executeTakeFirst();
            if (!version) return res.status(404).json({success: false, error: "No encontramos esa versión del bloque."});
            if (reject && version.authorId === user.id) return res.status(403).json({success: false, error: "No podés rechazar tu propia edición."});

            let replyToId = version.editId;
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
                if (depth >= 5) return res.status(400).json({success: false, error: "Los comentarios no pueden superar cinco niveles de profundidad."});
                replyToId = input.replyToId;
            }

            const created = await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:comment`}))`.execute(trx);
                if (reject) {
                    await sql`select pg_advisory_xact_lock(hashtext(${`${version.editId}:reaction`}))`.execute(trx);
                    const existingReaction = await trx.selectFrom("reaction")
                        .innerJoin("record", "record.id", "reaction.id")
                        .select(["reaction.id", "reaction.type"])
                        .where("reaction.subject_id", "=", version.editId)
                        .where("record.author_id", "=", user.id)
                        .executeTakeFirst();
                    if (existingReaction?.type === "reject") throw new TopicEditError(409, "Ya reaccionaste a esta edición.");
                    if (existingReaction) {
                        await trx.deleteFrom("reaction").where("id", "=", existingReaction.id).execute();
                        await trx.deleteFrom("record").where("id", "=", existingReaction.id).execute();
                    }
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
                if (reject) {
                    const reactionId = randomUUID();
                    await trx.insertInto("record").values({id: reactionId, type_id: "reaction", author_id: user.id}).execute();
                    await trx.insertInto("reaction").values({id: reactionId, type: "reject", subject_id: version.editId, reason_id: id}).execute();
                }
                const record = await trx.selectFrom("record").select("created_at").where("id", "=", id).executeTakeFirstOrThrow();
                return {
                    id,
                    commentNumber: `c-${number}`,
                    blockVersionId: version.id,
                    rootId: version.id,
                    replyToId: input.replyToId ?? version.id,
                    directReplyCount: 0,
                    rejection: reject,
                    deleted: false,
                    content,
                    createdAt: record.created_at.toISOString(),
                    author: user,
                };
            });
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
        const visibleRequestedBlocks = requestedBlocks.filter(block => !block.deleted);
        if (visibleRequestedBlocks.some((block, index) => index > 0 && visibleRequestedBlocks[index - 1].order >= block.order)) {
            return res.status(400).json({success: false, error: "El orden de los bloques no es válido."});
        }

        try {
            const blocks = await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:edit`}))`.execute(trx);
                const currentBlocks = await topicBlocks(trx, topicId);
                const currentByNumber = new Map(currentBlocks.map(block => [block.blockNumber, block]));
                const existingInputs = requestedBlocks.filter(block => block.blockNumber !== null);
                const submittedNumbers = existingInputs.map(block => block.blockNumber!);
                if (submittedNumbers.length !== currentBlocks.length
                    || new Set(submittedNumbers).size !== submittedNumbers.length
                    || submittedNumbers.some(blockNumber => !currentByNumber.has(blockNumber))) {
                    throw new TopicEditError(409, "Los bloques cambiaron. Recargá el tema antes de guardar.");
                }
                for (const block of existingInputs) {
                    const current = currentByNumber.get(block.blockNumber!)!;
                    if (block.id !== current.id) {
                        throw new TopicEditError(409, "Los bloques cambiaron. Recargá el tema antes de guardar.");
                    }
                    if (block.typeId !== current.typeId) {
                        throw new TopicEditError(400, "No se puede cambiar el tipo de un bloque existente.");
                    }
                }

                const changedExisting = existingInputs.filter(block => {
                    const current = currentByNumber.get(block.blockNumber!)!;
                    return block.deleted || block.content !== current.content || block.order !== current.order;
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
                        content: block.content,
                        order: block.order,
                        edit_id: editId,
                        deleted: block.deleted,
                    });
                }
                await trx.insertInto("block_version").values(versions).execute();
                return topicBlocks(trx, topicId);
            });
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

import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import {sql} from "kysely";
import type {BlockCommentsOutput, BlockType, CreateBlockCommentInput, CreateBlockCommentOutput, CreateTopicInput, CreateTopicOutput, SaveBlockInput, SaveBlockOutput, SaveBlockReorderInput, SaveBlockReorderOutput, SearchTopicsOutput, TopicBlock, TopicBlocksOutput, TopicBlockVersionsOutput, TopicOutput} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {requireSession, requiredUser} from "#/auth/middleware.js";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";
import {applyReorders, orderBetween, permutationFor} from "#/topics/block-order.js";

const BLOCK_PREFIXES: Record<BlockType["id"], string> = {parrafo: "p", h1: "h1", h2: "h2"};

type StoredTopicBlock = {
    id: string;
    blockNumber: string;
    typeId: BlockType["id"];
    content: string | null;
    initialOrder: string;
    createdAt: Date;
    commentCount: number;
};

async function topicBlocks(ctx: AppContext, topicId: string): Promise<TopicBlock[]> {
    const [blockResult, reorders] = await Promise.all([
        sql<StoredTopicBlock>`
            WITH ranked_versions AS (
                SELECT
                    block_version.id,
                    block_version.block_number AS "blockNumber",
                    block.type_id AS "typeId",
                    block_version.content,
                    FIRST_VALUE(block_version.order) OVER (
                        PARTITION BY block_version.topic_id, block_version.block_number
                        ORDER BY record.created_at ASC, record.id ASC
                    ) AS "initialOrder",
                    MIN(record.created_at) OVER (
                        PARTITION BY block_version.topic_id, block_version.block_number
                    ) AS "createdAt",
                    ROW_NUMBER() OVER (
                        PARTITION BY block_version.topic_id, block_version.block_number
                        ORDER BY record.created_at DESC, record.id DESC
                    ) AS version_rank,
                    (
                        SELECT COUNT(*)::int
                        FROM comment
                        INNER JOIN block_version AS commented_version ON commented_version.id = comment.reply_to_id
                        WHERE commented_version.topic_id = block_version.topic_id
                          AND commented_version.block_number = block_version.block_number
                    ) AS "commentCount"
                FROM block_version
                INNER JOIN block
                    ON block.topic_id = block_version.topic_id
                    AND block.block_number = block_version.block_number
                INNER JOIN record ON record.id = block_version.id
                WHERE block_version.topic_id = ${topicId}
            )
            SELECT id, "blockNumber", "typeId", content, "initialOrder", "createdAt", "commentCount"
            FROM ranked_versions
            WHERE version_rank = 1
        `.execute(ctx.kysely),
        ctx.kysely.selectFrom("block_reorder")
            .innerJoin("record", "record.id", "block_reorder.id")
            .select("block_reorder.permutation")
            .where("block_reorder.topic_id", "=", topicId)
            .orderBy("record.created_at", "asc")
            .orderBy("record.id", "asc")
            .execute(),
    ]);
    const ordered = applyReorders(
        blockResult.rows.map(block => ({blockNumber: block.blockNumber, order: block.initialOrder, createdAt: block.createdAt})),
        reorders.map(reorder => reorder.permutation),
    );
    const byNumber = new Map(blockResult.rows.map(block => [block.blockNumber, block]));
    return ordered.map(position => {
        const block = byNumber.get(position.blockNumber)!;
        return {
            id: block.id,
            blockNumber: block.blockNumber,
            typeId: block.typeId,
            content: block.content ?? "",
            order: position.order,
            commentCount: block.commentCount,
        };
    });
}

function databaseCode(error: unknown): string | undefined {
    if (!error || typeof error !== "object" || !("code" in error)) return undefined;
    return typeof error.code === "string" ? error.code : undefined;
}

function blockContent(input: Partial<SaveBlockInput>): {typeId: BlockType["id"]; content: string} | null {
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
                topicBlocks(ctx, req.params.id),
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

    router.get("/topics/:id/blocks/:blockNumber/versions", async (req, res) => {
        try {
            const versions = await ctx.kysely.selectFrom("block_version")
                .innerJoin("block", join => join
                    .onRef("block.topic_id", "=", "block_version.topic_id")
                    .onRef("block.block_number", "=", "block_version.block_number"))
                .innerJoin("record", "record.id", "block_version.id")
                .innerJoin("user", "user.id", "record.author_id")
                .select([
                    "block_version.id",
                    "block_version.block_number as blockNumber",
                    "block.type_id as typeId",
                    "block_version.content",
                    "block_version.order",
                    "record.created_at as createdAt",
                    "user.id as authorId",
                    "user.username as authorUsername",
                    sql<number>`(
                        SELECT COUNT(*)::int
                        FROM comment
                        WHERE comment.reply_to_id = block_version.id
                    )`.as("commentCount"),
                ])
                .where("block_version.topic_id", "=", req.params.id)
                .where("block_version.block_number", "=", req.params.blockNumber)
                .orderBy("record.created_at", "desc")
                .orderBy("record.id", "desc")
                .execute();

            if (versions.length === 0) {
                return res.status(404).json({success: false, error: "No encontramos ese bloque."});
            }

            const value: TopicBlockVersionsOutput = {
                versions: versions.map(version => ({
                    id: version.id,
                    blockNumber: version.blockNumber,
                    typeId: version.typeId as BlockType["id"],
                    content: version.content ?? "",
                    order: version.order,
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
                .innerJoin("block_version", "block_version.id", "comment.reply_to_id")
                .innerJoin("record", "record.id", "comment.id")
                .innerJoin("user", "user.id", "record.author_id")
                .select([
                    "comment.id",
                    "comment.comment_number as commentNumber",
                    "comment.reply_to_id as blockVersionId",
                    "comment.content",
                    "record.created_at as createdAt",
                    "user.id as authorId",
                    "user.username as authorUsername",
                ])
                .where("comment.topic_id", "=", req.params.id)
                .where("block_version.topic_id", "=", req.params.id)
                .where("block_version.block_number", "=", req.params.blockNumber)
                .orderBy("record.created_at", "desc")
                .orderBy("record.id", "desc")
                .execute();
            const value: BlockCommentsOutput = {comments: comments.map(comment => ({
                id: comment.id,
                commentNumber: comment.commentNumber,
                blockVersionId: comment.blockVersionId,
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

    router.post("/topics/:id/blocks/:blockNumber/comments", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        const blockNumber = req.params.blockNumber;
        if (typeof topicId !== "string" || typeof blockNumber !== "string") {
            return res.status(400).json({success: false, error: "El tema o bloque no es válido."});
        }
        const input = (req.body ?? {}) as Partial<CreateBlockCommentInput>;
        const content = typeof input.content === "string" ? input.content.trim() : "";
        if (typeof input.blockVersionId !== "string" || !content || content.length > 20_000) {
            return res.status(400).json({success: false, error: "Ingresá un comentario válido."});
        }
        try {
            const version = await ctx.kysely.selectFrom("block_version")
                .select("id")
                .where("id", "=", input.blockVersionId)
                .where("topic_id", "=", topicId)
                .where("block_number", "=", blockNumber)
                .executeTakeFirst();
            if (!version) return res.status(404).json({success: false, error: "No encontramos esa versión del bloque."});

            const created = await ctx.kysely.transaction().execute(async trx => {
                await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:comment`}))`.execute(trx);
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
                    reply_to_id: version.id,
                    content,
                }).execute();
                const record = await trx.selectFrom("record").select("created_at").where("id", "=", id).executeTakeFirstOrThrow();
                return {id, commentNumber: `c-${number}`, blockVersionId: version.id, content, createdAt: record.created_at.toISOString(), author: user};
            });
            const value: CreateBlockCommentOutput = {comment: created};
            return res.status(201).json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block comment creation failed");
            return res.status(500).json({success: false, error: "No pudimos publicar el comentario."});
        }
    });

    router.post("/topics/:id/blocks", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        if (typeof topicId !== "string") return res.status(400).json({success: false, error: "El tema no es válido."});
        const parsed = blockContent((req.body ?? {}) as Partial<SaveBlockInput>);
        if (!parsed) return res.status(400).json({success: false, error: "Ingresá contenido válido para el tipo de bloque seleccionado."});

        try {
            const currentBlocks = await topicBlocks(ctx, topicId);
            const requestedAnchor = (req.body as Partial<SaveBlockInput>).insertAfterBlockNumber;
            const anchorIndex = requestedAnchor === undefined
                ? currentBlocks.length - 1
                : requestedAnchor === null ? -1 : currentBlocks.findIndex(block => block.blockNumber === requestedAnchor);
            if (requestedAnchor !== undefined && requestedAnchor !== null && anchorIndex === -1) {
                return res.status(400).json({success: false, error: "No encontramos la posición donde insertar el bloque."});
            }
            const order = orderBetween(currentBlocks[anchorIndex]?.order ?? null, currentBlocks[anchorIndex + 1]?.order ?? null);
            const block = await ctx.kysely.transaction().execute(async trx => {
                const prefix = BLOCK_PREFIXES[parsed.typeId];
                await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:${prefix}`}))`.execute(trx);
                const existing = await trx.selectFrom("block")
                    .select("block_number")
                    .where("topic_id", "=", topicId)
                    .where("block_number", "like", `${prefix}-%`)
                    .execute();
                const number = existing.reduce((max, item) => {
                    const value = Number(item.block_number.slice(prefix.length + 1));
                    return Number.isInteger(value) ? Math.max(max, value) : max;
                }, 0) + 1;
                const id = randomUUID();
                const blockNumber = `${prefix}-${number}`;
                await trx.insertInto("block").values({
                    topic_id: topicId,
                    block_number: blockNumber,
                    type_id: parsed.typeId,
                }).execute();
                await trx.insertInto("record").values({id, type_id: "block", author_id: user.id}).execute();
                const created = await trx.insertInto("block_version").values({
                    id,
                    topic_id: topicId,
                    block_number: blockNumber,
                    content: parsed.content,
                    order,
                }).returning(["id", "block_number as blockNumber", "content"]).executeTakeFirstOrThrow();
                return {...created, typeId: parsed.typeId, content: created.content ?? "", order, commentCount: 0};
            });
            const value: SaveBlockOutput = {block};
            return res.status(201).json({success: true, value});
        } catch (error) {
            const code = databaseCode(error);
            if (code === "23503") return res.status(404).json({success: false, error: "No encontramos el tema o tipo de bloque."});
            ctx.logger.pino.error({error, databaseCode: code}, "block creation failed");
            return res.status(500).json({success: false, error: "No pudimos guardar el bloque."});
        }
    });

    router.patch("/topics/:id/blocks/:blockId", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        const blockId = req.params.blockId;
        if (typeof topicId !== "string" || typeof blockId !== "string") {
            return res.status(400).json({success: false, error: "El tema o bloque no es válido."});
        }
        const parsed = blockContent((req.body ?? {}) as Partial<SaveBlockInput>);
        if (!parsed) return res.status(400).json({success: false, error: "Ingresá contenido válido para el tipo de bloque seleccionado."});

        try {
            const current = await ctx.kysely.selectFrom("block_version")
                .innerJoin("block", join => join
                    .onRef("block.topic_id", "=", "block_version.topic_id")
                    .onRef("block.block_number", "=", "block_version.block_number"))
                .innerJoin("record", "record.id", "block_version.id")
                .select(["block_version.block_number as blockNumber", "block.type_id as typeId", "block_version.order"])
                .where("block_version.id", "=", blockId)
                .where("block_version.topic_id", "=", topicId)
                .orderBy("record.created_at", "asc")
                .orderBy("record.id", "asc")
                .executeTakeFirst();
            if (!current) return res.status(404).json({success: false, error: "No encontramos ese bloque."});
            if (current.typeId !== parsed.typeId) {
                return res.status(400).json({success: false, error: "No se puede cambiar el tipo de un bloque existente."});
            }

            const created = await ctx.kysely.transaction().execute(async trx => {
                const id = randomUUID();
                await trx.insertInto("record").values({id, type_id: "block", author_id: user.id}).execute();
                const version = await trx.insertInto("block_version").values({
                    id,
                    topic_id: topicId,
                    block_number: current.blockNumber,
                    content: parsed.content,
                    order: current.order,
                }).returning(["id", "block_number as blockNumber", "content"]).executeTakeFirstOrThrow();
                return {...version, typeId: current.typeId as BlockType["id"], content: version.content ?? "", order: current.order};
            });
            const updatedBlocks = await topicBlocks(ctx, topicId);
            const updatedBlock = updatedBlocks.find(block => block.blockNumber === created.blockNumber);
            if (!updatedBlock) throw new Error("Updated block was not found");
            const value: SaveBlockOutput = {block: updatedBlock};
            return res.json({success: true, value});
        } catch (error) {
            const code = databaseCode(error);
            if (code === "23503") return res.status(400).json({success: false, error: "El tipo de bloque no es válido."});
            ctx.logger.pino.error({error, databaseCode: code}, "block update failed");
            return res.status(500).json({success: false, error: "No pudimos guardar el bloque."});
        }
    });

    router.post("/topics/:id/reorders", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        if (typeof topicId !== "string") return res.status(400).json({success: false, error: "El tema no es válido."});
        const input = (req.body ?? {}) as Partial<SaveBlockReorderInput>;
        if (!Array.isArray(input.blockNumbers) || input.blockNumbers.some(value => typeof value !== "string")) {
            return res.status(400).json({success: false, error: "El orden no es válido."});
        }
        try {
            const blocks = await topicBlocks(ctx, topicId);
            const existing = new Set(blocks.map(block => block.blockNumber));
            if (input.blockNumbers.length !== existing.size || new Set(input.blockNumbers).size !== existing.size || input.blockNumbers.some(number => !existing.has(number))) {
                return res.status(409).json({success: false, error: "Los bloques cambiaron. Recargá el tema antes de guardar el orden."});
            }
            const permutation = permutationFor(input.blockNumbers);
            await ctx.kysely.transaction().execute(async trx => {
                const id = randomUUID();
                await trx.insertInto("record").values({id, type_id: "block_reorder", author_id: user.id}).execute();
                await trx.insertInto("block_reorder").values({
                    id,
                    topic_id: topicId,
                    permutation: JSON.stringify(permutation),
                }).execute();
            });
            const orderByNumber = new Map(permutation.map(item => [item.blockNumber, item.order]));
            const value: SaveBlockReorderOutput = {blocks: input.blockNumbers.map(number => ({...blocks.find(block => block.blockNumber === number)!, order: orderByNumber.get(number)!}))};
            return res.status(201).json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "block reorder creation failed");
            return res.status(500).json({success: false, error: "No pudimos guardar el reordenamiento."});
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

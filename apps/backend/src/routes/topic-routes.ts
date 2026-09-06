import {randomUUID} from "node:crypto";
import express, {type Router} from "express";
import {sql} from "kysely";
import type {BlockType, CreateTopicInput, CreateTopicOutput, SaveBlockInput, SaveBlockOutput, SearchTopicsOutput, TopicBlocksOutput, TopicOutput} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {requireSession, requiredUser} from "#/auth/middleware.js";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";

const BLOCK_PREFIXES: Record<BlockType["id"], string> = {parrafo: "p", h1: "h1", h2: "h2"};

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
                ctx.kysely.selectFrom("block")
                    .innerJoin("record", "record.id", "block.id")
                    .select([
                        "block.id",
                        "block.block_number as blockNumber",
                        "block.type_id as typeId",
                        "block.content",
                    ])
                    .where("block.topic_id", "=", req.params.id)
                    .orderBy("record.created_at", "asc")
                    .execute(),
                ctx.kysely.selectFrom("block_type")
                    .select(["id", "name"])
                    .where("id", "in", ["parrafo", "h1", "h2"])
                    .orderBy("id", "asc")
                    .execute(),
            ]);
            const value: TopicBlocksOutput = {
                blocks: blocks.map(block => ({...block, typeId: block.typeId as BlockType["id"], content: block.content ?? ""})),
                blockTypes: blockTypes as BlockType[],
            };
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error, databaseCode: databaseCode(error)}, "topic blocks lookup failed");
            return res.status(500).json({success: false, error: "No pudimos cargar los bloques."});
        }
    });

    router.post("/topics/:id/blocks", requireSession(ctx), async (req, res) => {
        const user = requiredUser(req);
        const topicId = req.params.id;
        if (typeof topicId !== "string") return res.status(400).json({success: false, error: "El tema no es válido."});
        const parsed = blockContent((req.body ?? {}) as Partial<SaveBlockInput>);
        if (!parsed) return res.status(400).json({success: false, error: "Ingresá contenido válido para el tipo de bloque seleccionado."});

        try {
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
                await trx.insertInto("record").values({id, topic_id: topicId, type_id: "block", author_id: user.id}).execute();
                const created = await trx.insertInto("block").values({
                    id,
                    topic_id: topicId,
                    block_number: `${prefix}-${number}`,
                    type_id: parsed.typeId,
                    content: parsed.content,
                }).returning(["id", "block_number as blockNumber", "type_id as typeId", "content"]).executeTakeFirstOrThrow();
                return {...created, typeId: created.typeId as BlockType["id"], content: created.content ?? ""};
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
        const topicId = req.params.id;
        const blockId = req.params.blockId;
        if (typeof topicId !== "string" || typeof blockId !== "string") {
            return res.status(400).json({success: false, error: "El tema o bloque no es válido."});
        }
        const parsed = blockContent((req.body ?? {}) as Partial<SaveBlockInput>);
        if (!parsed) return res.status(400).json({success: false, error: "Ingresá contenido válido para el tipo de bloque seleccionado."});

        try {
            const updated = await ctx.kysely.updateTable("block")
                .set({type_id: parsed.typeId, content: parsed.content})
                .where("id", "=", blockId)
                .where("topic_id", "=", topicId)
                .returning(["id", "block_number as blockNumber", "type_id as typeId", "content"])
                .executeTakeFirst();
            if (!updated) return res.status(404).json({success: false, error: "No encontramos ese bloque."});
            const value: SaveBlockOutput = {block: {...updated, typeId: updated.typeId as BlockType["id"], content: updated.content ?? ""}};
            return res.json({success: true, value});
        } catch (error) {
            const code = databaseCode(error);
            if (code === "23503") return res.status(400).json({success: false, error: "El tipo de bloque no es válido."});
            ctx.logger.pino.error({error, databaseCode: code}, "block update failed");
            return res.status(500).json({success: false, error: "No pudimos guardar el bloque."});
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

import {lockSearchTopic} from "./search/schema.js";
import {synchronizeTopicSearch} from "./search/index.js";
import {randomUUID} from "node:crypto";
import {sql, type Transaction, type Kysely} from "kysely";
import type {BlockComment, CreateDiscussionCommentInput} from "@cabildo-abierto/api";
import type {DB} from "#/db/types.js";
import {deleteReactionTree} from "#/services/record-reactions.js";
import {TopicActionError, lockTopicTitleEdits, convergeTopicName, initialTitleEdit} from "#/services/topic-title-edits.js";
import {createNotification} from "#/services/notifications.js";

export type DiscussionTarget = {id: string; rootId: string; topicId: string; blockNumber: string | null; kind: "edit" | "title" | "document"; documentBlockId?: string; documentVersionId?: string};
type Database = Kysely<DB> | Transaction<DB>;

export async function mutateDiscussion<T>(database: Kysely<DB>, target: DiscussionTarget, action: (trx: Transaction<DB>, authorId: string) => Promise<T>): Promise<T> {
    return database.transaction().execute(async trx => {
        await lockSearchTopic(trx, target.topicId);
        if (target.kind === "title") await lockTopicTitleEdits(trx, target.topicId);
        await sql`select pg_advisory_xact_lock(hashtext(${`${target.rootId}:reaction`}))`.execute(trx);
        const record = await trx.selectFrom("record").select(["author_id", "deleted"]).where("id", "=", target.rootId).executeTakeFirst();
        if (!record || record.deleted) throw new TopicActionError(404, "La publicación ya no está disponible.");
        const result = await action(trx, record.author_id);
        if (target.kind === "title") await convergeTopicName(trx, target.topicId);
        await synchronizeTopicSearch(trx, target.topicId);
        return result;
    });
}

export async function discussionComments(database: Database, topicId: string, scope: {blockNumber: string} | {rootId: string} | {documentBlockId: string}): Promise<BlockComment[]> {
    let query = database.selectFrom("comment")
        .innerJoin("record", "record.id", "comment.id")
        .innerJoin("record as root_record", "root_record.id", "comment.root_id")
        .innerJoin("user", "user.id", "record.author_id")
        .leftJoin("block_version", join => join.onRef("block_version.edit_id", "=", "comment.edit_id")
            .onRef("block_version.topic_id", "=", "comment.topic_id").onRef("block_version.block_number", "=", "comment.block_number"))
        .select(["comment.id", "comment.comment_number", "comment.root_id", "comment.reply_to_id", "comment.content", "record.deleted", "record.created_at", "user.id as authorId", "user.username",
            sql<string>`coalesce(block_version.id, comment.root_id)`.as("displayRootId"),
            sql<number>`(SELECT count(*)::int FROM comment r WHERE r.reply_to_id = comment.id)`.as("directReplyCount"),
            sql<string | null>`(SELECT subject_id FROM reaction WHERE reason_id = comment.id AND type = 'reject' LIMIT 1)`.as("reactionSubjectId"),
        ]).where("comment.topic_id", "=", topicId);
    query = "documentBlockId" in scope
        ? query.where("comment.document_block_id", "=", scope.documentBlockId)
        : "blockNumber" in scope
        ? query.where("comment.block_number", "=", scope.blockNumber).where("root_record.deleted", "=", false)
        : query.where("comment.root_id", "=", scope.rootId).where("comment.document_block_id", "is", null);
    const rows = await query.orderBy("record.created_at", "desc").orderBy("record.id", "desc").execute();
    const byId = new Map(rows.map(row => [row.id, row]));
    const depthOf = (id: string, seen = new Set<string>()): number | null => {
        const row = byId.get(id);
        if (!row?.reactionSubjectId || seen.has(id)) return null;
        if (row.reactionSubjectId === row.root_id) return 0;
        seen.add(id);
        const parentDepth = depthOf(row.reactionSubjectId, seen);
        return parentDepth === null ? null : parentDepth + 1;
    };
    return rows.map(row => {
        const depth = depthOf(row.id);
        return {id: row.id, commentNumber: row.comment_number, blockVersionId: row.displayRootId, rootId: row.displayRootId,
            replyToId: row.reply_to_id === row.root_id ? row.displayRootId : row.reply_to_id,
            directReplyCount: row.directReplyCount, rejection: depth !== null,
            suggestedVote: depth === null ? null : depth % 2 === 0 ? "reject" : "accept", replicaDepth: depth,
            deleted: row.deleted, content: row.content, createdAt: row.created_at.toISOString(), author: {id: row.authorId, username: row.username}};
    });
}

async function requireMutableTitleReaction(trx: Transaction<DB>, target: DiscussionTarget) {
    if (target.kind === "document") throw new TopicActionError(400, "Los bloques internos solo admiten comentarios.");
    if (target.kind === "title" && await initialTitleEdit(trx, target.topicId) === target.rootId) {
        throw new TopicActionError(403, "El título inicial no puede recibir votos.");
    }
}

export async function acceptDiscussion(trx: Transaction<DB>, target: DiscussionTarget, userId: string, authorId: string, deleteReason?: boolean) {
    await requireMutableTitleReaction(trx, target);
    if (userId === authorId) throw new TopicActionError(403, "No podés votar tu propia publicación.");
    const existing = await trx.selectFrom("reaction").innerJoin("record", "record.id", "reaction.id").select(["reaction.id", "reaction.type", "reaction.reason_id"])
        .where("subject_id", "=", target.rootId).where("author_id", "=", userId).executeTakeFirst();
    if (existing?.type === "accept") throw new TopicActionError(409, "Ya votaste esta publicación.");
    if (existing) {
        if (typeof deleteReason !== "boolean") throw new TopicActionError(400, "Elegí qué hacer con la justificación del rechazo.");
        if (deleteReason && existing.reason_id) await trx.updateTable("record").set({deleted: true}).where("id", "=", existing.reason_id).execute();
        await deleteReactionTree(trx, existing.id);
    }
    const id = randomUUID();
    await trx.insertInto("record").values({id, type_id: "reaction", author_id: userId}).execute();
    await trx.insertInto("reaction").values({id, type: "accept", subject_id: target.rootId, reason_id: null}).execute();
    await createNotification(trx, {recipientId: authorId, actorId: userId, kind: "positive_vote", sourceId: id,
        topicId: target.topicId, targetId: target.id, blockNumber: target.blockNumber});
}

export async function cancelDiscussionReaction(trx: Transaction<DB>, target: DiscussionTarget, userId: string, deleteReason: boolean) {
    await requireMutableTitleReaction(trx, target);
    const reaction = await trx.selectFrom("reaction").innerJoin("record", "record.id", "reaction.id")
        .select(["reaction.id", "reaction.type", "reason_id"]).where("subject_id", "=", target.rootId).where("author_id", "=", userId).executeTakeFirst();
    if (!reaction) throw new TopicActionError(404, "No encontramos tu voto.");
    if (reaction.type === "reject" && deleteReason && reaction.reason_id) await trx.updateTable("record").set({deleted: true}).where("id", "=", reaction.reason_id).execute();
    await deleteReactionTree(trx, reaction.id);
}

export async function deleteDiscussionComment(trx: Transaction<DB>, target: DiscussionTarget, commentId: string, userId: string) {
    const comment = await trx.selectFrom("comment").innerJoin("record", "record.id", "comment.id")
        .select("author_id").where("comment.id", "=", commentId).where("topic_id", "=", target.topicId)
        .$if(target.kind !== "document", query => query.where("root_id", "=", target.rootId))
        .where("block_number", target.blockNumber === null ? "is" : "=", target.blockNumber)
        .where("document_block_id", target.documentBlockId ? "=" : "is", target.documentBlockId ?? null).executeTakeFirst();
    if (!comment) throw new TopicActionError(404, "No encontramos ese comentario.");
    if (comment.author_id !== userId) throw new TopicActionError(403, "Solo el autor puede eliminar este comentario.");
    const reaction = await trx.selectFrom("reaction").select("id").where("reason_id", "=", commentId).where("type", "=", "reject").executeTakeFirst();
    if (reaction) await deleteReactionTree(trx, reaction.id);
    await trx.updateTable("record").set({deleted: true}).where("id", "=", commentId).execute();
}

export async function publishDiscussionComment(trx: Transaction<DB>, target: DiscussionTarget, user: {id: string; username: string}, authorId: string, input: CreateDiscussionCommentInput): Promise<BlockComment> {
    if (target.kind === "document" && (input.reject || input.replica)) throw new TopicActionError(400, "Los bloques internos solo admiten comentarios.");
    const content = typeof input.content === "string" ? input.content.trim() : "";
    if (!content || content.length > 20_000 || (input.reject !== undefined && typeof input.reject !== "boolean")
        || (input.replica !== undefined && typeof input.replica !== "boolean") || (input.reject && input.replica)
        || (input.replyToId !== undefined && typeof input.replyToId !== "string") || (input.replica && !input.replyToId)) {
        throw new TopicActionError(400, "Ingresá un comentario válido.");
    }
    if (input.reject || input.replica) await requireMutableTitleReaction(trx, target);
    if (input.reject && user.id === authorId) throw new TopicActionError(403, "No podés rechazar tu propia publicación.");
    const replyToId = input.replyToId ?? target.rootId;
    let replicaDepth: number | null = null;
    let recipientId = authorId;
    if (input.replyToId) {
        const parent = await trx.selectFrom("comment").innerJoin("record", "record.id", "comment.id").select(["comment.id", "author_id", "record.deleted"])
            .where("comment.id", "=", input.replyToId).where("topic_id", "=", target.topicId)
            .$if(target.kind !== "document", query => query.where("root_id", "=", target.rootId))
            .where("block_number", target.blockNumber === null ? "is" : "=", target.blockNumber)
            .where("document_block_id", target.documentBlockId ? "=" : "is", target.documentBlockId ?? null).executeTakeFirst();
        if (!parent || parent.deleted) throw new TopicActionError(404, "No encontramos ese comentario.");
        recipientId = parent.author_id;
        if (input.replica) {
            if (parent.author_id === user.id) throw new TopicActionError(403, "No podés replicar tu propio voto.");
            const comments = await discussionComments(trx, target.topicId, target.blockNumber === null ? {rootId: target.rootId} : {blockNumber: target.blockNumber});
            const depth = comments.find(comment => comment.id === parent.id)?.replicaDepth;
            if (depth === null || depth === undefined) throw new TopicActionError(409, "El voto que querías replicar ya no está disponible.");
            replicaDepth = depth + 1;
            const duplicate = await trx.selectFrom("reaction").innerJoin("record", "record.id", "reaction.id").select("reaction.id")
                .where("subject_id", "=", replyToId).where("type", "=", "reject").where("author_id", "=", user.id).executeTakeFirst();
            if (duplicate) throw new TopicActionError(409, "Ya replicaste este voto.");
        }
    }
    if (input.reject) {
        const existing = await trx.selectFrom("reaction").innerJoin("record", "record.id", "reaction.id").select(["reaction.id", "reaction.type"])
            .where("subject_id", "=", target.rootId).where("author_id", "=", user.id).executeTakeFirst();
        if (existing?.type === "reject") throw new TopicActionError(409, "Ya rechazaste esta publicación.");
        if (existing) await deleteReactionTree(trx, existing.id);
    }
    await sql`select pg_advisory_xact_lock(hashtext(${`${target.topicId}:comment`}))`.execute(trx);
    const existingNumbers = await trx.selectFrom("comment").select("comment_number").where("topic_id", "=", target.topicId).execute();
    const number = existingNumbers.reduce((max, item) => /^c-\d+$/.test(item.comment_number) ? Math.max(max, Number(item.comment_number.slice(2))) : max, 0) + 1;
    const id = randomUUID();
    await trx.insertInto("record").values({id, type_id: "comment", author_id: user.id}).execute();
    await trx.insertInto("comment").values({id, topic_id: target.topicId, comment_number: `c-${number}`, root_id: target.rootId,
        reply_to_id: replyToId, content, block_number: target.blockNumber, edit_id: target.rootId, document_block_id: target.documentBlockId ?? null}).execute();
    if (input.reject || input.replica) {
        const reactionId = randomUUID();
        await trx.insertInto("record").values({id: reactionId, type_id: "reaction", author_id: user.id}).execute();
        await trx.insertInto("reaction").values({id: reactionId, type: "reject", subject_id: input.replica ? replyToId : target.rootId, reason_id: id}).execute();
    }
    await createNotification(trx, {recipientId, actorId: user.id,
        kind: input.replica ? "replica" : input.reject ? "rejection" : input.replyToId ? "reply" : "comment",
        sourceId: id, topicId: target.topicId, targetId: target.documentVersionId ?? target.id,
        blockNumber: target.blockNumber, documentBlockId: target.documentBlockId});
    const record = await trx.selectFrom("record").select("created_at").where("id", "=", id).executeTakeFirstOrThrow();
    const depth = input.reject ? 0 : replicaDepth;
    return {id, commentNumber: `c-${number}`, blockVersionId: target.id, rootId: target.id, replyToId: input.replyToId ?? target.id,
        directReplyCount: 0, rejection: depth !== null, suggestedVote: depth === null ? null : depth % 2 === 0 ? "reject" : "accept",
        replicaDepth: depth, deleted: false, content, createdAt: record.created_at.toISOString(), author: user};
}

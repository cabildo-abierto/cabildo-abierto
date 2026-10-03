import {sql, type Kysely, type Transaction} from "kysely";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";
import type {TopicTitleEdit} from "@cabildo-abierto/api";
import type {DB} from "#/db/types.js";
import {activeRejectCounts, rejectTree, visibleRejectCounts} from "#/services/record-reactions.js";

type Database = Kysely<DB> | Transaction<DB>;

export class TopicActionError extends Error {
    constructor(readonly status: 400 | 403 | 404 | 408 | 409 | 410 | 413 | 429, message: string) { super(message); }
}

export async function lockTopicTitleEdits(database: Transaction<DB>, topicId: string) {
    await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:title`}))`.execute(database);
}

export async function currentTopicTitleEdit(database: Database, topicId: string): Promise<string | null> {
    const edits = await database.selectFrom("edit")
        .innerJoin("record", "record.id", "edit.id")
        .select("edit.id").where("topic_id", "=", topicId).where("record.deleted", "=", false).where("edit.title", "is not", null)
        .orderBy("record.created_at", "desc").orderBy("record.id", "desc").execute();
    const rejects = activeRejectCounts(await rejectTree(database, edits.map(edit => edit.id)));
    return edits.find(edit => !rejects.get(edit.id))?.id ?? null;
}

export async function initialTitleEdit(database: Database, topicId: string): Promise<string> {
    const edit = await database.selectFrom("edit").innerJoin("record", "record.id", "edit.id")
        .select("edit.id").where("topic_id", "=", topicId).where("edit.title", "is not", null)
        .orderBy("record.created_at").orderBy("record.id").executeTakeFirstOrThrow();
    return edit.id;
}

// The caller holds the topic's title lock for the entire mutation.
export async function convergeTopicName(database: Transaction<DB>, topicId: string) {
    const editId = await currentTopicTitleEdit(database, topicId);
    if (!editId) throw new Error("Topic has no accepted title edit");
    const edit = await database.selectFrom("edit").select("title").where("id", "=", editId).executeTakeFirstOrThrow();
    await database.updateTable("topic").set({title: edit.title!, slug: canonicalizeTopicId(edit.title!)})
        .where("id", "=", topicId).execute();
}

export async function topicTitleEditViews(database: Database, ids: string[], userId?: string): Promise<TopicTitleEdit[]> {
    if (!ids.length) return [];
    const rows = await database.selectFrom("edit")
        .innerJoin("record", "record.id", "edit.id")
        .innerJoin("user", "user.id", "record.author_id")
        .innerJoin("topic", "topic.id", "edit.topic_id")
        .select(["edit.id", "edit.topic_id", "edit.title", "edit.message", "record.created_at", "record.deleted",
            "user.id as authorId", "user.username", "topic.title as topicTitle", "topic.slug as topicSlug",
            sql<number>`(SELECT count(*)::int FROM reaction WHERE subject_id = edit.id AND type = 'accept')`.as("acceptCount"),
            sql<number>`(SELECT count(*)::int FROM comment
                INNER JOIN record comment_record ON comment_record.id = comment.id
                WHERE comment.root_id = edit.id AND comment_record.deleted = false)`.as("commentCount"),
            sql<string | null>`(SELECT reaction.type FROM reaction INNER JOIN record r ON r.id = reaction.id
                WHERE reaction.subject_id = edit.id AND r.author_id = ${userId ?? null} LIMIT 1)`.as("userReaction"),
        ]).where("edit.id", "in", ids).execute();
    const tree = await rejectTree(database, ids);
    const rejects = activeRejectCounts(tree);
    const visible = visibleRejectCounts(tree);
    const current = new Map(await Promise.all([...new Set(rows.map(row => row.topic_id))].map(async topicId =>
        [topicId, await currentTopicTitleEdit(database, topicId)] as const)));
    const initial = new Map(await Promise.all([...current.keys()].map(async topicId =>
        [topicId, await initialTitleEdit(database, topicId)] as const)));
    const byId = new Map(rows.map(row => [row.id, row]));
    return ids.map(id => {
        const row = byId.get(id)!;
        return {
            id: row.id, topic: {id: row.topic_id, title: row.topicTitle, slug: row.topicSlug},
            title: row.title!, slug: canonicalizeTopicId(row.title!), message: row.message, initial: initial.get(row.topic_id) === id,
            createdAt: row.created_at.toISOString(), author: {id: row.authorId, username: row.username},
            status: row.deleted ? "deleted" : rejects.get(id) ? "rejected" : current.get(row.topic_id) === id ? "current" : "accepted",
            acceptCount: row.acceptCount, rejectCount: visible.unreplicated.get(id) ?? 0,
            replicatedRejectCount: visible.replicated.get(id) ?? 0,
            commentCount: row.commentCount,
            userReaction: row.userReaction === "accept" || row.userReaction === "reject" ? row.userReaction : null,
        };
    });
}

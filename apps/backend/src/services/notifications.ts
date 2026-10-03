import {randomUUID} from "node:crypto";
import type {Kysely, Transaction} from "kysely";
import type {DB} from "#/db/types.js";

type Database = Kysely<DB> | Transaction<DB>;
type NotificationKind = DB["notification"]["kind"];

export async function createNotification(database: Database, input: {
    recipientId: string;
    actorId: string;
    kind: NotificationKind;
    sourceId: string;
    topicId: string;
    targetId: string;
    blockNumber?: string | null;
    documentBlockId?: string | null;
}) {
    if (input.recipientId === input.actorId) return;
    await database.insertInto("notification").values({
        id: randomUUID(), recipient_id: input.recipientId, actor_id: input.actorId,
        kind: input.kind, source_id: input.sourceId, topic_id: input.topicId,
        target_id: input.targetId, block_number: input.blockNumber ?? null,
        document_block_id: input.documentBlockId ?? null, read_at: null,
    }).onConflict(conflict => conflict.columns(["recipient_id", "kind", "source_id"]).doNothing()).execute();
}

export async function notifyPreviousBlockAuthors(database: Database, input: {
    topicId: string;
    editId: string;
    actorId: string;
    previousBlocks: {id: string; blockNumber: string}[];
}) {
    if (!input.previousBlocks.length) return;
    const versions = await database.selectFrom("block_version")
        .innerJoin("record", "record.id", "block_version.edit_id")
        .select(["block_version.id", "record.author_id"])
        .where("block_version.id", "in", input.previousBlocks.map(block => block.id)).execute();
    const authors = new Map(versions.map(version => [version.id, version.author_id]));
    const notified = new Set<string>();
    for (const block of input.previousBlocks) {
        const recipientId = authors.get(block.id);
        if (!recipientId || recipientId === input.actorId || notified.has(recipientId)) continue;
        notified.add(recipientId);
        await createNotification(database, {recipientId, actorId: input.actorId, kind: "edit", sourceId: input.editId,
            topicId: input.topicId, targetId: input.editId, blockNumber: block.blockNumber});
    }
}

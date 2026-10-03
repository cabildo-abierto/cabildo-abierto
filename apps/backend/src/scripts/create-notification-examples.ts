import {randomUUID} from "node:crypto";
import {env} from "#/lib/env.js";
import {setupKysely} from "#/setup.js";
import {canonicalizeTopicId} from "#/topics/canonicalize-topic-id.js";
import {acceptDiscussion, publishDiscussionComment, type DiscussionTarget} from "#/services/discussions.js";
import {notifyPreviousBlockAuthors} from "#/services/notifications.js";
import {synchronizeTopicSearch} from "#/services/search/index.js";

const requiredMigration = "0008_notification_rejections_7_8.sql";

function developmentDatabaseUrl(): string {
    if (env.NODE_ENV !== "development") throw new Error("Este script solo se puede ejecutar con NODE_ENV=development.");
    const raw = env.DIRECT_URL || env.DATABASE_URL;
    const url = new URL(raw);
    const databaseName = decodeURIComponent(url.pathname.slice(1));
    if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) || !/dev/i.test(databaseName)) {
        throw new Error("El script requiere una base de desarrollo local (host loopback y nombre con 'dev').");
    }
    return raw;
}

async function run() {
    const database = setupKysely(developmentDatabaseUrl(), 1);
    try {
        const migration = await database.selectFrom("migration").select("file_name")
            .where("file_name", "=", requiredMigration).executeTakeFirst();
        if (!migration) throw new Error(`Aplicá primero la migración ${requiredMigration}.`);
        const users = await database.selectFrom("user").select(["id", "username"])
            .where("username", "in", ["prueba02", "prueba03"]).execute();
        const prueba02 = users.find(user => user.username === "prueba02");
        const prueba03 = users.find(user => user.username === "prueba03");
        if (!prueba02 || !prueba03) throw new Error("Faltan prueba02 o prueba03. Ejecutá primero script:create-test-users.");

        const title = `Ejemplo de notificaciones ${Date.now()} ${randomUUID().slice(0, 8)}`;
        const topicId = canonicalizeTopicId(title);
        const blockNumber = "p-1";
        const result = await database.transaction().execute(async trx => {
            await trx.insertInto("topic").values({id: topicId, title, slug: topicId}).execute();
            const titleEditId = randomUUID();
            await trx.insertInto("record").values({id: titleEditId, type_id: "edit", author_id: prueba02.id}).execute();
            await trx.insertInto("edit").values({id: titleEditId, topic_id: topicId, title, message: null}).execute();
            await trx.insertInto("topic_redirect").values({slug: topicId, topic_id: topicId, edit_id: titleEditId}).execute();

            const initialEditId = randomUUID();
            const initialVersionId = randomUUID();
            const secondVersionId = randomUUID();
            await trx.insertInto("record").values({id: initialEditId, type_id: "edit", author_id: prueba02.id}).execute();
            await trx.insertInto("edit").values({id: initialEditId, topic_id: topicId, message: "Dos bloques de ejemplo"}).execute();
            await trx.insertInto("block").values([
                {topic_id: topicId, block_number: blockNumber, type_id: "parrafo"},
                {topic_id: topicId, block_number: "p-2", type_id: "parrafo"},
            ]).execute();
            await trx.insertInto("block_version").values([
                {id: initialVersionId, topic_id: topicId, block_number: blockNumber,
                    content: "Versión inicial de prueba02 para mostrar las notificaciones.", order: "m", edit_id: initialEditId, deleted: false},
                {id: secondVersionId, topic_id: topicId, block_number: "p-2",
                    content: "Segundo bloque: prueba03 moverá el primero debajo de este.", order: "n", edit_id: initialEditId, deleted: false},
            ]).execute();
            const initialTarget: DiscussionTarget = {id: initialVersionId, rootId: initialEditId, topicId, blockNumber, kind: "edit"};

            await publishDiscussionComment(trx, initialTarget, prueba03, prueba02.id,
                {content: "Comentario de prueba03 sobre tu edición."});
            const ownComment = await publishDiscussionComment(trx, initialTarget, prueba02, prueba02.id,
                {content: "Comentario de prueba02 para recibir una respuesta."});
            await publishDiscussionComment(trx, initialTarget, prueba03, prueba02.id,
                {content: "Respuesta de prueba03 a tu comentario.", replyToId: ownComment.id});
            await acceptDiscussion(trx, initialTarget, prueba03.id, prueba02.id);

            const nextEditId = randomUUID();
            const nextVersionId = randomUUID();
            await trx.insertInto("record").values({id: nextEditId, type_id: "edit", author_id: prueba03.id}).execute();
            await trx.insertInto("edit").values({id: nextEditId, topic_id: topicId, message: null}).execute();
            await trx.insertInto("block_version").values({id: nextVersionId, topic_id: topicId, block_number: blockNumber,
                content: "Versión inicial de prueba02 para mostrar las notificaciones.", order: "o", edit_id: nextEditId, deleted: false}).execute();
            await notifyPreviousBlockAuthors(trx, {topicId, editId: nextEditId, actorId: prueba03.id,
                previousBlocks: [{id: initialVersionId, blockNumber}]});

            const nextTarget: DiscussionTarget = {id: nextVersionId, rootId: nextEditId, topicId, blockNumber, kind: "edit"};
            const rejection = await publishDiscussionComment(trx, nextTarget, prueba02, prueba03.id,
                {content: "Voto de rechazo de prueba02 para mostrar una réplica.", reject: true});
            const firstReplica = await publishDiscussionComment(trx, nextTarget, prueba03, prueba03.id,
                {content: "Réplica de prueba03 a tu voto de rechazo.", replyToId: rejection.id, replica: true});
            const secondReplica = await publishDiscussionComment(trx, nextTarget, prueba02, prueba03.id,
                {content: "Réplica de prueba02 a la primera réplica.", replyToId: firstReplica.id, replica: true});
            await publishDiscussionComment(trx, nextTarget, prueba03, prueba03.id,
                {content: "Réplica de prueba03 a tu réplica.", replyToId: secondReplica.id, replica: true});

            const secondEditId = randomUUID();
            const changedSecondVersionId = randomUUID();
            await trx.insertInto("record").values({id: secondEditId, type_id: "edit", author_id: prueba02.id}).execute();
            await trx.insertInto("edit").values({id: secondEditId, topic_id: topicId, message: null}).execute();
            await trx.insertInto("block_version").values({id: changedSecondVersionId, topic_id: topicId, block_number: "p-2",
                content: "Edición de prueba02 que prueba03 rechazará.", order: "n", edit_id: secondEditId, deleted: false}).execute();
            await notifyPreviousBlockAuthors(trx, {topicId, editId: secondEditId, actorId: prueba02.id,
                previousBlocks: [{id: secondVersionId, blockNumber: "p-2"}]});
            const secondTarget: DiscussionTarget = {id: changedSecondVersionId, rootId: secondEditId, topicId, blockNumber: "p-2", kind: "edit"};
            await publishDiscussionComment(trx, secondTarget, prueba03, prueba02.id,
                {content: "Rechazo de prueba03 a tu edición de ejemplo.", reject: true});

            await synchronizeTopicSearch(trx, topicId);
            const notifications = await trx.selectFrom("notification")
                .select(["recipient_id", "kind"])
                .where("topic_id", "=", topicId).execute();
            const forPrueba02 = notifications.filter(notification => notification.recipient_id === prueba02.id);
            const kinds = new Set(forPrueba02.map(notification => notification.kind));
            for (const kind of ["comment", "reply", "replica", "rejection", "positive_vote", "edit"] as const) {
                if (!kinds.has(kind)) throw new Error(`No se generó la notificación ${kind} para prueba02.`);
            }
            return {total: notifications.length, forPrueba02: forPrueba02.length};
        });
        console.log(`Tema creado: /tema/${topicId}`);
        console.log(`Notificaciones creadas: ${result.total} (${result.forPrueba02} para prueba02).`);
        console.log("Ingresá como prueba02 y abrí /notificaciones para ver los seis tipos.");
    } finally {
        await database.destroy();
    }
}

run().catch(error => {
    console.error(error instanceof Error ? error.message : "No se pudieron crear los ejemplos.");
    process.exitCode = 1;
});

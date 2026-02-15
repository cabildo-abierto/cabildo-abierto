import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from "uuid";
import {getCollectionFromUri, isPost} from "@cabildo-abierto/utils";
import {isReactionCollection} from "#/utils/type-utils.js";
import {DBDeleteError, DBInsertError, DBSelectError} from "#/utils/errors.js";
import {Effect} from "effect";


// para cada par (record-referencia) queremos saber si hay una interacción
// la relación es recursiva, hay una interacción entre (rec, ref) si:
// rec es el record de la referencia (rec.uri = ref.referencingContentId)
// rec es un record que responde o reacciona a otro que interactúa con ref

// ¿cómo lo mantenemos actualizado?
// cuando se crea una referencia:
//   creamos recursivamente interacciones de todos los records que responden o reaccionan al referencing content
// cuando se elimina una referencia
//   se eliminan automáticamente todas sus interacciones
// cuando se crea una respuesta o reacción
//   se crean interacciones para ese record con todas las referencias con las que interactúe el record al que se responde
// cuando se elimina una respuesta o reacción
//   se eliminan automáticamente sus interacciones


export async function updateTopicInteractionsOnNewReactions(ctx: AppContext, records: string[]): Promise<string[]> {
    records = records
        .filter(r => isReactionCollection(getCollectionFromUri(r)))
    if (records.length == 0) return []

    const bs = 500
    if (records.length > bs) {
        const topicsWithNewInteractions: string[] = []
        for (let i = 0; i < records.length; i += bs) {
            topicsWithNewInteractions.push(
                ...await updateTopicInteractionsOnNewReactions(ctx, records.slice(i, i + bs))
            )
        }
        return topicsWithNewInteractions
    }

    return await ctx.kysely.transaction().execute(async trx => {
        const interactions = await trx
            .selectFrom("TopicInteraction")
            .innerJoin("Reaction", "Reaction.subjectId", "TopicInteraction.recordId")
            .innerJoin("Reference", "Reference.id", "TopicInteraction.referenceId")
            .where("Reaction.uri", "in", records)
            .select(["referenceId", "Reaction.uri as recordId", "Reference.referencedTopicId"])
            .execute()

        await ctx.kysely
            .insertInto("TopicInteraction")
            .values(interactions.map(i => ({
                referenceId: i.referenceId,
                recordId: i.recordId,
                id: uuidv4(),
                touched: new Date(),
            })))
            .onConflict(oc => oc.columns(["recordId", "referenceId"]).doNothing())
            .execute()

        return interactions.map(i => i.referencedTopicId)
    })
}


export const updateTopicInteractionsOnNewReplies = (
    ctx: AppContext,
    records: string[]
): Effect.Effect<string[], DBInsertError> => Effect.gen(function* () {
    records = records
        .filter(r => isPost(getCollectionFromUri(r)))
    if (records.length == 0) return []

    const bs = 500
    if (records.length > bs) {
        const topicsWithNewInteractions: string[] = []
        for (let i = 0; i < records.length; i += bs) {
            topicsWithNewInteractions.push(...yield* updateTopicInteractionsOnNewReplies(ctx, records.slice(i, i + bs)))
        }
        return topicsWithNewInteractions
    }

    return yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async trx => {
            const interactions = await trx
                .selectFrom("TopicInteraction")
                .innerJoin("Post", "Post.replyToId", "TopicInteraction.recordId")
                .innerJoin("Reference", "Reference.id", "TopicInteraction.referenceId")
                .where("Post.uri", "in", records)
                .select(["referenceId", "Post.uri as recordId", "Reference.referencedTopicId"])
                .execute()

            if (interactions.length > 0) {
                await ctx.kysely
                    .insertInto("TopicInteraction")
                    .values(interactions.map(i => ({
                        referenceId: i.referenceId,
                        recordId: i.recordId,
                        id: uuidv4(),
                        touched: new Date(),
                    })))
                    .onConflict(oc => oc.columns(["recordId", "referenceId"]).doNothing())
                    .execute()
            }

            return interactions.map(i => i.referencedTopicId)
        }),
        catch: error => new DBInsertError(error)
    })
})


type InteractionToInsert = {
    uri: string
    referenceId: string
    referencedTopicId: string
}

export const updateTopicInteractionsOnNewReferences = (
    ctx: AppContext,
    references: string[]
): Effect.Effect<string[], DBInsertError | DBDeleteError> => Effect.gen(function* () {
    if(references.length == 0) return []

    const bs = 2000
    if (references.length > bs) {
        const topicsWithNewInteractions: string[] = []
        for (let i = 0; i < references.length; i += bs) {
            topicsWithNewInteractions.push(...yield* updateTopicInteractionsOnNewReferences(ctx, references.slice(i, i + bs)))
        }
        return topicsWithNewInteractions
    }

    const interactions: InteractionToInsert[] = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .withRecursive("interaction", (db) => {
                const base = db
                    .selectFrom("Record")
                    .innerJoin("Reference", "Record.uri", "Reference.referencingContentId")
                    .select([
                        "Record.uri",
                        "Reference.id as referenceId",
                        "Reference.referencedTopicId"
                    ])
                    .where("Reference.id", "in", references)

                const recursive = db
                    .selectFrom("Post")
                    .innerJoin("interaction", "Post.replyToId", "interaction.uri")
                    .select([
                        "Post.uri",
                        "interaction.referenceId",
                        "interaction.referencedTopicId"
                    ])
                    .distinctOn(["uri", "referenceId"])

                return base.unionAll(recursive)
            })
            .selectFrom("interaction")
            .select([
                "interaction.uri",
                "interaction.referenceId",
                "interaction.referencedTopicId"
            ])
            .unionAll(eb => eb
                .selectFrom("Reaction")
                .innerJoin("interaction", "interaction.uri", "Reaction.subjectId")
                .select([
                    "Reaction.uri",
                    "interaction.referenceId",
                    "interaction.referencedTopicId"
                ])
            )
            .execute(),
        catch: error => new DBInsertError(error)
    })

    const date = new Date()
    if (interactions.length > 0) {
        const values = interactions.map(i => ({
            id: uuidv4(),
            recordId: i.uri,
            referenceId: i.referenceId
        }))

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("TopicInteraction")
                .values(values
                    .map(v => ({...v, touched_tz: date}))
                )
                .onConflict(oc => oc
                    .columns(["recordId", "referenceId"]).doUpdateSet(eb => ({
                        touched_tz: eb.ref("excluded.touched_tz")
                    })))
                .execute(),
            catch: error => new DBInsertError(error)
        })

    }
    yield* Effect.tryPromise({
        try: () => ctx.kysely
            .deleteFrom("TopicInteraction")
            .where("TopicInteraction.touched_tz", "<", date)
            .where("TopicInteraction.referenceId", "in", references)
            .execute(),
        catch: error =>  new DBDeleteError(error)
    })
    return interactions.map(i => i.referencedTopicId)
})


export const getEditedTopics = (ctx: AppContext, since: Date) => Effect.gen(function* () {
    const topics = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .select("id")
            .where(eb => eb.or([
                eb.exists(eb
                    .selectFrom("TopicVersion")
                    .whereRef("TopicVersion.topicId", "=", "Topic.id")
                    .innerJoin("Record", "Record.uri", "TopicVersion.uri")
                    .where("Record.created_at", ">", since)
                ),
                eb.exists(eb
                    .selectFrom("Reaction")
                    .innerJoin("Record", "Reaction.subjectId", "Record.uri")
                    .where("Record.created_at", ">", since)
                    .innerJoin("TopicVersion", "TopicVersion.uri", "Record.uri")
                    .whereRef("TopicVersion.topicId", "=", "Topic.id")
                )
            ]))
            .execute(),
        catch: error => new DBSelectError(error)
    })

    return topics.map(t => t.id)
})
import {AppContext} from "#/setup.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DBInsertError, DBSelectError} from "#/utils/errors.js";


// Testeo de popularidades:
// -- cuando se crea un tema la popularidad es 1
// -- cuando se edita un tema la popularidad aumenta en 1
// -- cuando se crea un post, articulo o topic version que menciona un tema la popularidad aumenta en 1
// -- cuando se responde a un post, articulo o topic version que interactua con un tema la popularidad aumenta en 1
// -- cuando se da like a un post, articulo o topic version que interactua con un tema la popularidad aumenta en 1
// -- cuando se elimina la unica edicion la popularidad se reduce en 1
// -- cuando se elimina un like la popularidad se reduce en 1
// -- cuando se elimina un post que menciona y que fue likeado la popularidad se reduce en 2

const getHumanUsers = (ctx: AppContext) => Effect.gen(function* () {
    const users = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select("did")
            .where("orgValidation", "is", null)
            .execute(),
        catch: () => new DBSelectError()
    })

    return new Set(users.map(u => u.did))
})


/***
    Actualiza la popularidad de una lista de temas asumiendo que sus TopicInteractions
    ya fueron creadas.
***/
export const updateTopicPopularities = (
    ctx: AppContext,
    topicIds: string[]
) => Effect.gen(function* () {
    if(topicIds && topicIds.length == 0) return
    const lastMonth = new Date(Date.now() - 1000*3600*24*30)
    const lastWeek = new Date(Date.now() - 1000*3600*24*7)
    const lastDay = new Date(Date.now() - 1000*3600*24)

    const humanUsers = yield* getHumanUsers(ctx)


    let batchSize = 2000
    for(let i = 0; i < topicIds.length; i+=batchSize){
        const batchIds = topicIds.slice(i, i+batchSize)
        const batchInteractions = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("TopicInteraction")
                .innerJoin("Record", "Record.uri", "TopicInteraction.recordId")
                .innerJoin("Reference", "Reference.id", "TopicInteraction.referenceId")
                .where("Record.created_at_tz", ">", lastMonth)
                .where("Reference.referencedTopicId", "in", batchIds)
                .select(["recordId", "Reference.referencedTopicId as topicId", "Record.created_at_tz"])
                .orderBy("Record.created_at_tz desc")
                .execute(),
            catch: (error) =>  new DBSelectError(error)
        }).pipe(Effect.withSpan("SQL/get topic interactions"))

        ctx.logger.pino.info({batchInteractions}, "interactions")

        const m = new Map<string, {
            interactionsLastDay: Set<string>
            interactionsLastWeek: Set<string>
            interactionsLastMonth: Set<string>
        }>()
        batchIds.forEach(t => {
            m.set(t, {
                interactionsLastDay: new Set<string>(),
                interactionsLastWeek: new Set<string>(),
                interactionsLastMonth: new Set<string>()
            })
        })

        batchInteractions.forEach((d) => {
            if(!d.created_at_tz) return
            let cur = m.get(d.topicId)!
            if(cur){
                const authorId = getDidFromUri(d.recordId)
                if(humanUsers.has(authorId)){
                    cur.interactionsLastMonth.add(authorId)
                    if(d.created_at_tz > lastWeek){
                        cur.interactionsLastWeek.add(authorId)
                    }
                    if(d.created_at_tz > lastDay){
                        cur.interactionsLastDay.add(authorId)
                    }

                    m.set(d.topicId, cur)
                }
            }
        })

        const values = Array.from(m).map(x => ({
            id: x[0],
            popularityScoreLastDay: x[1].interactionsLastDay.size,
            popularityScoreLastWeek: x[1].interactionsLastWeek.size,
            popularityScoreLastMonth: x[1].interactionsLastMonth.size
        }))

        ctx.logger.pino.info({values, topicIds}, "values")

        if(values.length == 0) {
            ctx.logger.pino.info({batchCount: batchIds.length}, "no topics to update")
            continue
        }

        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("Topic")
                .values(values.map(v => ({...v, synonyms: []})))
                .onConflict((oc) => oc.column("id").doUpdateSet({
                    popularityScoreLastDay: eb => eb.ref("excluded.popularityScoreLastDay"),
                    popularityScoreLastWeek: eb => eb.ref("excluded.popularityScoreLastWeek"),
                    popularityScoreLastMonth: eb => eb.ref("excluded.popularityScoreLastMonth")
                }))
                .execute(),
            catch: (error) => new DBInsertError(error)
        }).pipe(Effect.withSpan("SQL/insert popularities"))
    }
}).pipe(Effect.withSpan("updateTopicPopularities", {attributes: {count: topicIds.length}}))


export const updateAllTopicPopularities = (ctx: AppContext) => Effect.gen(function* () {
    const topics = yield* Effect.tryPromise({
        try: () => ctx.kysely.selectFrom("Topic").select("id").execute(),
        catch: (error) => new DBSelectError(error)
    })

    yield* updateTopicPopularities(ctx, topics.map(t => t.id))
})
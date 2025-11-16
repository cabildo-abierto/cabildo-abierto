import {AppContext} from "#/setup.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {testUsers} from "#/services/admin/stats/stats.js";


// Testeo de popularidades:
// -- cuando se crea un tema la popularidad es 1
// -- cuando se edita un tema la popularidad aumenta en 1
// -- cuando se crea un post, articulo o topic version que menciona un tema la popularidad aumenta en 1
// -- cuando se responde a un post, articulo o topic version que interactua con un tema la popularidad aumenta en 1
// -- cuando se da like a un post, articulo o topic version que interactua con un tema la popularidad aumenta en 1
// -- cuando se elimina la unica edicion la popularidad se reduce en 1
// -- cuando se elimina un like la popularidad se reduce en 1
// -- cuando se elimina un post que menciona y que fue likeado la popularidad se reduce en 2

async function getHumanUsers(ctx: AppContext) {
    const users = await ctx.kysely
        .selectFrom("User")
        .select("did")
        .where("orgValidation", "is", null)
        .where("handle", "not in", testUsers)
        .execute()

    return new Set(users.map(u => u.did))
}


export async function updateTopicPopularities(ctx: AppContext, topicIds: string[]) {
    if(topicIds && topicIds.length == 0) return
    const lastMonth = new Date(Date.now() - 1000*3600*24*30)
    const lastWeek = new Date(Date.now() - 1000*3600*24*7)
    const lastDay = new Date(Date.now() - 1000*3600*24)

    const humanUsers = await getHumanUsers(ctx)


    let batchSize = 2000
    for(let i = 0; i < topicIds.length; i+=batchSize){
        const batchIds = topicIds.slice(i, i+batchSize)
        const t1 = Date.now()
        const batchInteractions = await ctx.kysely
            .selectFrom("TopicInteraction")
            .innerJoin("Record", "Record.uri", "TopicInteraction.recordId")
            .innerJoin("Reference", "Reference.id", "TopicInteraction.referenceId")
            .where("Record.created_at", ">", lastMonth)
            .where("Reference.referencedTopicId", "in", batchIds)
            .select(["recordId", "Reference.referencedTopicId as topicId", "Record.created_at"])
            .execute()
        const t2 = Date.now()

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
            let cur = m.get(d.topicId)!
            if(cur){
                const authorId = getDidFromUri(d.recordId)
                if(humanUsers.has(authorId)){
                    cur.interactionsLastMonth.add(authorId)
                    if(d.created_at > lastWeek){
                        cur.interactionsLastWeek.add(authorId)
                    }
                    if(d.created_at > lastDay){
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

        if(values.length == 0) {
            ctx.logger.pino.info({batchCount: batchIds.length}, "no topics to update")
            continue
        }

        await ctx.kysely
            .insertInto("Topic")
            .values(values.map(v => ({...v, synonyms: []})))
            .onConflict((oc) => oc.column("id").doUpdateSet({
                popularityScoreLastDay: eb => eb.ref("excluded.popularityScoreLastDay"),
                popularityScoreLastWeek: eb => eb.ref("excluded.popularityScoreLastWeek"),
                popularityScoreLastMonth: eb => eb.ref("excluded.popularityScoreLastMonth")
            }))
            .execute()
        const t3 = Date.now()

        ctx.logger.logTimes("update topic popularities batch", [t1, t2 ,t3], {topics: batchIds.length, total: topicIds.length})
    }
}


export async function updateAllTopicPopularities(ctx: AppContext) {
    const topics = await ctx.kysely.selectFrom("Topic").select("id").execute()

    await updateTopicPopularities(ctx, topics.map(t => t.id))
}
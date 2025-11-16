import {CAHandler} from "#/utils/handler.js";
import {v4 as uuidv4} from "uuid";
import {getCategories} from "#/services/wiki/topics.js";

type UserInterest = {
    id: string
    selected: boolean
}

const categoryScores: Record<string, number> = {
    "Economía": 10,
    "Política": 10,
    "Sociedad": 10,
    "Fútbol": 10,
    "Deportes": 10,
    "Cultura": 10,
    "Cine": 10,
    "Televisión": 10,
    "Música": 10,
    "Turismo": 10,
    "Ciencia y tecnología": 10,
    "Historia": 10,
    "Comidas": 10
}

function categoryScoreAsInterest(a: string): number {
    return categoryScores[a] ?? 0
}

export const getInterestsHandler: CAHandler<{}, UserInterest[]> = async (ctx, agent) => {

    const [res, categories] = await Promise.all([
        ctx.kysely
            .selectFrom("UserInterest")
            .selectAll()
            .where("UserInterest.userId", "=", agent.did)
            .execute(),
        getCategories(ctx, agent, {})
    ])

    function cmp(a: string, b: string) {
        return categoryScoreAsInterest(a) - categoryScoreAsInterest(b)
    }

    const data = categories.data?.toSorted(cmp).filter(x => x != "Sin categoría").map(c => {
        return {
            id: c,
            selected: res.some(r => r.topicCategoryId == c)
        }
    })

    return {data}
}


export const newInterestHandler: CAHandler<{ params: { id: string } }, {}> = async (ctx, agent, {params}) => {

    try {
        await ctx.kysely.insertInto("UserInterest")
            .values([{
                id: uuidv4(),
                userId: agent.did,
                topicCategoryId: params.id
            }])
            .onConflict(oc => oc.columns(["userId", "topicCategoryId"]).doNothing())
            .execute()
    } catch (error) {
        ctx.logger.pino.error({error, did: agent.did, id: params.id}, "error inserting interest")
        return {error: "No se pudo seleccionar el interés."}
    }

    return {data: {}}
}


export const removeInterestHandler: CAHandler<{ params: { id: string } }, {}> = async (ctx, agent, {params}) => {

    try {
        await ctx.kysely.deleteFrom("UserInterest")
            .where("userId", "=", agent.did)
            .where("topicCategoryId", "=", params.id)
            .execute()
    } catch (error) {
        ctx.logger.pino.error({error, did: agent.did, id: params.id}, "error removing interest")
        return {error: "Ocurrió un error al remover el interés."}
    }

    return {data: {}}
}
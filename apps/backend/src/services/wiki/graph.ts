import {getCategoriesWithCounts} from "./topics.js";
import {AppContext} from "#/setup.js";
import {TopicsGraph} from "#/lib/types.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {stringListIncludes, stringListIsEmpty} from "#/services/dataset/read.js";
import {unique} from "@cabildo-abierto/utils";


async function clearEmptyCategories(ctx: AppContext) {
    const emptyCategories = await ctx.kysely
        .selectFrom("TopicCategory")
        .where(eb => eb.not(eb.exists(eb
            .selectFrom("TopicToCategory")
            .whereRef("TopicToCategory.categoryId", "=", "TopicCategory.id")
        )))
        .select("TopicCategory.id")
        .execute()

    ctx.logger.pino.info({emptyCategories}, "clearing empty categories")

    await ctx.kysely
        .deleteFrom("TopicCategory")
        .where("TopicCategory.id", "in", emptyCategories.map(c => c.id))
        .execute()
}


export const updateCategoriesGraph = async (ctx: AppContext) => {
    ctx.logger.pino.info("updating categories graph")

    await clearEmptyCategories(ctx)

    const t1 = Date.now()
    let references: {referencedTopicId: string, referencingTopicId: string}[]
    try {
        references = await ctx.kysely
            .selectFrom("Reference")
            .innerJoin("TopicVersion", "TopicVersion.uri", "Reference.referencingContentId")
            .innerJoin("Topic as ReferencingTopic", "ReferencingTopic.currentVersionId", "TopicVersion.uri")
            .innerJoin("Topic as ReferencedTopic", "ReferencedTopic.id", "Reference.referencedTopicId")
            .select([
                "ReferencedTopic.id as referencedTopicId",
                "ReferencingTopic.id as referencingTopicId",
            ])
            .execute()
    } catch (err) {
        ctx.logger.pino.error({error: err}, "error getting references")
        return
    }
    const t2 = Date.now()

    let categories: {topicId: string, categoryId: string}[] = []
    try {
        categories = await ctx.kysely
            .selectFrom("TopicToCategory")
            .select(["topicId", "categoryId"])
            .execute()
    } catch (err) {
        ctx.logger.pino.error({error: err}, "error getting categories")
        return
    }
    const t3 = Date.now()

    let values: {idCategoryA: string, idCategoryB: string}[] = []
    try {
        const topicToCategoriesMap = new Map<string, string[]>()
        const categoriesMap = new Map<string, number>()

        for (const {topicId, categoryId} of categories) {
            const cur = topicToCategoriesMap.get(topicId)
            if(cur == undefined){
                topicToCategoriesMap.set(topicId, [categoryId])
            } else {
                cur.push(categoryId)
            }
            categoriesMap.set(categoryId, (categoriesMap.get(categoryId) ?? 0)+1)
        }

        for (const r of references) {
            const xId = r.referencingTopicId
            const catsX = topicToCategoriesMap.get(xId)
            const yId = r.referencedTopicId
            const catsY = topicToCategoriesMap.get(yId)
            if (!catsY || !catsX) continue

            catsX.forEach((catX) => {
                catsY.forEach((catY) => {
                    if (catX != catY) {
                        values.push({idCategoryA: catX, idCategoryB: catY})
                    }
                })
            })
        }

        values = unique(values, v => `${v.idCategoryA}:${v.idCategoryB}`)
    } catch (err) {
        ctx.logger.pino.error({error: err}, "error computing edges")
        return
    }
    const t4 = Date.now()

    try {
        await ctx.kysely.transaction().execute(async (trx) => {
            await trx
                .deleteFrom("CategoryLink")
                .execute()

            await trx.insertInto("CategoryLink")
                .values(values)
                .onConflict(oc => oc.columns(["idCategoryA", "idCategoryB"]).doNothing())
                .execute()
        })
    } catch (err) {
        ctx.logger.pino.error({error: err}, "error applying update")
    }

    const t5 = Date.now()
    ctx.logger.logTimes("update categories graph", [t1, t2, t3, t4, t5])
}

export const getCategoriesGraph: CAHandlerNoAuth<{}, TopicsGraph> = async (ctx, agent, {}) => {
    const links = await ctx.kysely.selectFrom("CategoryLink")
        .select(["idCategoryA", "idCategoryB"])
        .execute()

    const {data: categories, error} = await getCategoriesWithCounts(ctx, agent, {})
    if (!categories) {
        return {error}
    }

    const nodeIds = categories.map(cat => cat.category)

    const data = categories.map(c => ({id: c.category, categorySize: c.size}))

    return {
        data: {
            nodeIds: Array.from(nodeIds),
            edges: links.map(l => ({
                x: l.idCategoryA,
                y: l.idCategoryB
            })).filter(e => e.x != e.y),
            data
        }
    }
}


export const getCategoryGraph: CAHandlerNoAuth<{ query: { c: string[] | string } }, TopicsGraph> = async (ctx, agent, {query}) => {
    const categories = typeof query.c == "string" ? [query.c] : query.c

    const baseQuery = ctx.kysely
            .with("Node", db => db
                .selectFrom("Topic")
                .innerJoin("TopicVersion", "TopicVersion.uri", "Topic.currentVersionId")
                .select(["id", "currentVersionId"])
                .where(categories.includes("Sin categoría") ?
                    stringListIsEmpty("Categorías") :
                    eb =>
                        eb.and(
                            categories.map(c => stringListIncludes("Categorías", c))
                        )
                )
            )

    const t1 = Date.now()
    const [nodeIds, edges] = await Promise.all([
        baseQuery
            .selectFrom("Node")
            .select(["Node.id"])
            .execute(),
        baseQuery
            .selectFrom('Node as Node1')
            .innerJoin("Reference", "Reference.referencedTopicId", "Node1.id")
            .innerJoin("Node as Node2", "Reference.referencingContentId", "Node2.currentVersionId")
            .select(['Node1.id as x', "Node2.id as y"])
            .execute()
    ])

    ctx.logger.logTimes(`get cateogory graph ${categories}`, [t1, Date.now()])

    return {
        data: {
            nodeIds: nodeIds.map(t => t.id),
            edges
        }
    }
}

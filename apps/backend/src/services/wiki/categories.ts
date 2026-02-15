import {AppContext} from "#/setup.js";
import {getTopicCategories} from "#/services/wiki/utils.js";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {unique} from "@cabildo-abierto/utils";
import {Effect} from "effect";
import {DBInsertError, DBSelectError} from "#/utils/errors.js";


// actualizamos la tabla topicToCategory para estos temas y creamos las categorías nuevas
// no se eliminan categorías anteriores
export const updateTopicsCategoriesOnTopicsChange = (
    ctx: AppContext,
    topicIds: string[]
) => Effect.gen(function* () {
    if(topicIds.length === 0) return

    const topics = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom('Topic')
            .leftJoin('TopicVersion', 'TopicVersion.uri', 'Topic.currentVersionId')
            .select([
                "id",
                "TopicVersion.props"
            ])
            .where("Topic.id", "in", topicIds)
            .execute(),
        catch: error => new DBSelectError(error)
    })

    const topicCategories = topics.map((t) => ({
        topicId: t.id,
        categoryIds: getTopicCategories(t.props as unknown as ArCabildoabiertoWikiTopicVersion.TopicProp[])
    }))

    const allCategoryIds = unique(topicCategories.flatMap(({categoryIds}) => categoryIds))

    if (allCategoryIds.length === 0) return

    const topicCategoryValues = topicCategories.flatMap(({topicId, categoryIds}) =>
        categoryIds.map((categoryId) => ({
            topicId,
            categoryId
        }))
    )

    yield* Effect.tryPromise({
        try: () => ctx.kysely.transaction().execute(async (trx) => {
            try {
                await trx
                    .insertInto('TopicCategory')
                    .values(allCategoryIds.map(id => ({id})))
                    .onConflict((oc) => oc.column('id').doNothing())
                    .execute()
            } catch (err) {
                ctx.logger.pino.error({error: err}, `Error inserting categories.`)
            }

            await trx
                .deleteFrom('TopicToCategory')
                .where("topicId", "in", topicIds)
                .execute()

            await trx
                .insertInto("TopicToCategory")
                .values(topicCategoryValues)
                .onConflict((oc) => oc.columns(['topicId', 'categoryId']).doNothing())
                .execute()
        }),
        catch: (error) => new DBInsertError(error)
    })
})


export async function updateTopicsCategories(ctx: AppContext) {
    const topics = await ctx.kysely
        .selectFrom('Topic')
        .select(['id'])
        .leftJoin('TopicVersion', 'TopicVersion.uri', 'Topic.currentVersionId')
        .select([
            'TopicVersion.props'
        ])
        .execute();

    const topicCategories = topics.map((t) => ({
        topicId: t.id,
        categoryIds: getTopicCategories(t.props as unknown as ArCabildoabiertoWikiTopicVersion.TopicProp[])
    }))

    const t1 = Date.now();

    const allCategoryIds = [
        ...new Set(topicCategories.flatMap(({categoryIds}) => categoryIds))
    ];

    if (allCategoryIds.length === 0) {
        ctx.logger.pino.info('No categories to update.');
        return;
    }


    await ctx.kysely.transaction().execute(async (trx) => {
        try {
            await trx
                .insertInto('TopicCategory')
                .values(allCategoryIds.map(id => ({id})))
                .onConflict((oc) => oc.column('id').doNothing())
                .execute();
        } catch (err) {
            ctx.logger.pino.error(`Error inserting categories: ${err}.`);
        }

        const topicCategoryValues = topicCategories.flatMap(({topicId, categoryIds}) =>
            categoryIds.map((categoryId) => ({
                topicId,
                categoryId
            }))
        );

        if (topicCategoryValues.length === 0) {
            ctx.logger.pino.info('No topic-category relationships to update.');
            return;
        }

        let existing: { topicId: string, categoryId: string }[] = []
        try {
            existing = await trx
                .selectFrom('TopicToCategory')
                .select(['topicId', 'categoryId'])
                .execute();
        } catch (error) {
            ctx.logger.pino.error({error}, "Error getting existing relations")
            return
        }
        const batchSize = 2000;

        ctx.logger.pino.info({count: topicCategoryValues.length}, "inserting new category relations")

        for (let i = 0; i < topicCategoryValues.length; i += batchSize) {
            ctx.logger.pino.info(`Batch ${i}.`)
            try {
                await trx
                    .insertInto('TopicToCategory')
                    .values(topicCategoryValues.slice(i, i + batchSize))
                    .onConflict((oc) => oc.columns(['topicId', 'categoryId']).doNothing())
                    .execute();
            } catch (error) {
                ctx.logger.pino.error({error}, `Error inserting relations.`);
            }
        }
        const toDelete = existing.filter(r => !topicCategoryValues.some(v => v.topicId == r.topicId && v.categoryId == r.categoryId));


        ctx.logger.pino.info({count: toDelete.length}, "deleting old category relations")

        try {
            if (toDelete.length > 0) {
                for (let i = 0; i < toDelete.length; i += batchSize) {
                    const chunk = toDelete.slice(i, i + batchSize);
                    try {
                        await trx
                            .deleteFrom('TopicToCategory')
                            .where(({eb, refTuple, tuple}) =>
                                eb(
                                    refTuple('topicId', 'categoryId'),
                                    'in',
                                    chunk.map((r) => tuple(r.topicId, r.categoryId))
                                )
                            )
                            .execute();
                    } catch (err) {
                        ctx.logger.pino.error({error: err}, "error deleting old relations")
                        console.log({error: err}, `error deleting batch`);
                    }
                }
            }
        } catch (err) {
            ctx.logger.pino.error({error: err}, "error deleting old category relations")
        }

        const nonEmptyCategories = (await trx
            .selectFrom("TopicCategory")
            .where(eb => eb.or([
                eb.exists(eb
                    .selectFrom("TopicToCategory")
                    .whereRef("TopicToCategory.categoryId", "=", "TopicCategory.id")
                ),
                eb.exists(eb
                    .selectFrom("UserInterest")
                    .whereRef("UserInterest.topicCategoryId", "=", "TopicCategory.id")
                )
            ]))
            .select("id")
            .execute()
        ).map(c => c.id)

        await trx
            .deleteFrom("CategoryLink")
            .where(
                eb => eb.or([
                    eb("idCategoryA", "not in", nonEmptyCategories),
                    eb("idCategoryB", "not in", nonEmptyCategories)
                ])
            )
            .execute()

        await trx
            .deleteFrom("TopicCategory")
            .where(
                "id",
                "not in",
                nonEmptyCategories
            )
            .execute()
    })

    ctx.logger.logTimes("update-topic-categories done", [t1, Date.now()])
}




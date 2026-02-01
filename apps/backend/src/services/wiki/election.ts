
import {
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api";
import {AppContext} from "#/setup.js";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {getDataset, HydrationError, NotFoundError} from "#/services/dataset/read.js";
import {Effect} from "effect";
import {DBError} from "#/services/write/article.js";
import {DataPlane, FetchFromBskyError, makeDataPlane} from "#/services/hydration/dataplane.js";

export type TopicData = {
    id: string
    props: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    repliesCount: number
}


export const getTopicsDataForElectionVisualization = (
    ctx: AppContext,
    v: ArCabildoabiertoEmbedVisualization.Main
): Effect.Effect<TopicData[], DBError | HydrationError | NotFoundError | FetchFromBskyError, DataPlane> => Effect.gen(function* () {
    if(!ArCabildoabiertoEmbedVisualization.isDatasetDataSource(v.dataSource)) return []
    if(!ArCabildoabiertoEmbedVisualization.isEleccion(v.spec)){
        return []
    }

    const candidateCol = v.spec.columnaTopicIdCandidato
    const alianzaCol = v.spec.columnaTopicIdAlianza
    const districtCol = v.spec.columnaTopicIdDistrito

    if(!candidateCol && !alianzaCol && !districtCol) return []

    const datasetUri = v.dataSource.dataset

    const data = yield* getDataset(
        ctx,
        datasetUri
    )

    if(!data) return []

    const dataset: Record<string, any>[] = JSON.parse(data.data)

    const topicIds = new Set<string>()
    for(let i = 0; i < dataset.length; i++) {
        if(candidateCol) topicIds.add(dataset[i][candidateCol])
        if(alianzaCol) topicIds.add(dataset[i][alianzaCol])
        if(districtCol) topicIds.add(dataset[i][districtCol])
    }

    if(topicIds.size == 0) return []

    const topicsData = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .innerJoin("TopicVersion", "Topic.currentVersionId", "TopicVersion.uri")
            .select([
                "Topic.id as id",
                "TopicVersion.props",
                eb => eb
                    .selectFrom("Post")
                    .innerJoin("TopicVersion as OtherTopicVersion", "Post.replyToId", "OtherTopicVersion.uri")
                    .whereRef("OtherTopicVersion.topicId", "=", "Topic.id")
                    .select(eb => eb.fn.count<number>("Post.uri").as("count"))
                    .as("repliesCount")
            ])
            .where("TopicVersion.topicId", "in", Array.from(topicIds))
            .execute(),
        catch: () => new DBError()
    })

    return topicsData.map(t => ({
        id: t.id,
        props: t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[],
        repliesCount: t.repliesCount ?? 0,
    }))
})


export const getTopicsDataForElectionVisualizationHandler: EffHandlerNoAuth<{v: ArCabildoabiertoEmbedVisualization.Main}, TopicData[]> = (
    ctx,
    agent,
    params
) => {
    return Effect.provideServiceEffect(
        getTopicsDataForElectionVisualization(ctx, params.v).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener los datos para la visualización."))),
        DataPlane,
        makeDataPlane(ctx, agent)
    )
}
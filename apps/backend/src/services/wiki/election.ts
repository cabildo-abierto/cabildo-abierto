
import {
    ArCabildoabiertoEmbedVisualization,
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api";
import {AppContext} from "#/setup.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {getDataset} from "#/services/dataset/read.js";

export type TopicData = {
    id: string
    props: ArCabildoabiertoWikiTopicVersion.TopicProp[]
    repliesCount: number
}


export const getTopicsDataForElectionVisualization = async (ctx: AppContext, v: ArCabildoabiertoEmbedVisualization.Main): Promise<TopicData[]> => {
    if(!ArCabildoabiertoEmbedVisualization.isDatasetDataSource(v.dataSource)) return []
    if(!ArCabildoabiertoEmbedVisualization.isEleccion(v.spec)){
        return []
    }

    const candidateCol = v.spec.columnaTopicIdCandidato
    const alianzaCol = v.spec.columnaTopicIdAlianza
    const districtCol = v.spec.columnaTopicIdDistrito

    if(!candidateCol && !alianzaCol && !districtCol) return []

    const datasetUri = v.dataSource.dataset

    const {data} = await getDataset(
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

    const topicsData = await ctx.kysely
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
        .execute()

    return topicsData.map(t => ({
        id: t.id,
        props: t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[],
        repliesCount: t.repliesCount ?? 0,
    }))
}


export const getTopicsDataForElectionVisualizationHandler: CAHandlerNoAuth<{v: ArCabildoabiertoEmbedVisualization.Main}, TopicData[]> = async (ctx, agent, params) => {
    return {
        data: await getTopicsDataForElectionVisualization(ctx, params.v)
    }
}
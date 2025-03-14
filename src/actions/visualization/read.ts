"use server"
import {EngagementProps, FeedContentProps, VisualizationProps} from "../../app/lib/definitions";
import {unstable_cache} from "next/cache";
import {db} from "../../db";
import {
    addCounters,
    enDiscusionQuery,
    reactionsQuery,
    recordQuery,
    revalidateEverythingTime,
    visualizationQuery
} from "../utils";
import {getSessionDid} from "../auth";
import {getUserEngagementInFeed} from "../feed/inicio";
import {addCountersToFeed} from "../feed/utils";


export async function getVisualizations(){
    let v: FeedContentProps[] = await unstable_cache(
        async () => {
            return await db.record.findMany({
                select: {
                    ...enDiscusionQuery,
                    visualization: visualizationQuery
                },
                where: {
                    collection: "ar.com.cabildoabierto.visualization",
                    visualization: {
                        isNot: null
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
        },
        ["visualizations"],
        {
            tags: ["visualizations"],
            revalidate: revalidateEverythingTime
        }
    )()

    const did = await getSessionDid()
    const engagement = await getUserEngagementInFeed(v, did)

    v = addCountersToFeed(v, engagement)

    return v
}


export async function getVisualization(uri: string): Promise<{visualization?: VisualizationProps, error?: string}> {

    try {
        const getVisualization = unstable_cache(
            async () => {
                return await getVisualizationNoCache(uri)
            },
            [uri],
            {
                tags: [uri, "visualization"],
                revalidate: revalidateEverythingTime
            }
        )()

        const did = await getSessionDid()
        const [{visualization, error}, engagement] = await Promise.all([getVisualization, getUserEngagementInFeed([{uri}], did)])

        if(error) return {error}

        return {visualization: addCounters(visualization, engagement)}
    } catch (error) {
        console.error("Error getting visualization", uri)
        console.error(error)
        return {error}
    }
}


export async function getVisualizationNoCache(uri: string): Promise<{visualization?: VisualizationProps & EngagementProps, error?: string}> {
    try {
        const v: VisualizationProps = await db.record.findUnique({
            select: {
                ...recordQuery,
                ...reactionsQuery,
                visualization: visualizationQuery,
            },
            where: {
                uri: uri
            }
        })

        return {visualization: v}
    } catch (e) {
        return {error: "Error al obtener la visualización"}
    }
}
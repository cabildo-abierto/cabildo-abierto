import {CAHandlerNoAuth} from "#/utils/handler.js"
import {Agent} from "#/utils/session-agent.js"
import {
    ArCabildoabiertoWikiTopicVersion,
} from "@cabildo-abierto/api"
import {getCollectionFromUri, getDidFromUri} from "@cabildo-abierto/utils"
import {editorStatusToEn} from "#/services/wiki/topics.js"
import {AppContext} from "#/setup.js";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {getTopicVersionStatusFromReactions} from "#/services/monetization/author-dashboard.js";


export function getTopicVersionViewer(viewerDid: string, reactions: {uri: string}[]): ArCabildoabiertoWikiTopicVersion.VersionInHistory["viewer"] {
    let accept: string | undefined
    let reject: string | undefined

    if (reactions) {
        reactions.forEach(a => {
            if(getDidFromUri(a.uri) != viewerDid) return
            const collection = getCollectionFromUri(a.uri)
            if (collection == "ar.cabildoabierto.wiki.voteAccept") {
                accept = a.uri
            } else if (collection == "ar.cabildoabierto.wiki.voteReject") {
                reject = a.uri
            }
        })
    }
    return {
        accept, reject
    }
}


export async function getTopicHistory(ctx: AppContext, id: string, agent?: Agent) {
    const did = agent?.hasSession() ? agent.did : null

    const versions = await ctx.kysely
        .selectFrom("TopicVersion")
        .innerJoin("Record", "Record.uri", "TopicVersion.uri")
        .innerJoin("Content", "Content.uri", "TopicVersion.uri")
        .innerJoin("Topic", "Topic.id", "TopicVersion.topicId")
        .select([
            "Record.uri",
            "Record.cid",
            "Record.created_at",
            "Record.created_at_tz",
            "diff",
            "charsAdded",
            "charsDeleted",
            "monetizedContribution",
            "charsContribution",
            "Topic.protection",
            "message",
            "accCharsAdded",
            "props",
            "prevAcceptedUri",
            "authorship",
            eb => jsonArrayFrom(eb
                .selectFrom("Reaction")
                .whereRef("Reaction.subjectId", "=", "TopicVersion.uri")
                .innerJoin("Record as ReactionRecord", "ReactionRecord.uri", "Reaction.uri")
                .innerJoin("User as ReactionAuthor", "ReactionAuthor.did", "ReactionRecord.authorId")
                .select([
                    "Reaction.uri",
                    "ReactionAuthor.editorStatus"
                ])
                .orderBy("ReactionRecord.authorId")
                .orderBy("ReactionRecord.created_at_tz desc")
                .distinctOn("ReactionRecord.authorId")
            ).as("reactions"),
            eb => eb
                .selectFrom("Post as Reply")
                .select(eb => eb.fn.count<number>("Reply.uri").as("count"))
                .whereRef("Reply.replyToId", "=", "Record.uri").as("replyCount")
        ])
        .where("Record.cid", "is not", null)
        .where("Record.record", "is not", null)
        .where("TopicVersion.topicId", "=", id)
        .orderBy("created_at asc")
        .execute()

    const dataplane = new Dataplane(ctx, agent)
    await dataplane.fetchProfileViewBasicHydrationData(versions.map(v => getDidFromUri(v.uri)))

    const topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory = {
        id,
        versions: versions.map(v => {
            if (!v.cid) return null

            const viewer = getTopicVersionViewer(
                did ?? "no did",
                v.reactions
            )
            const author = hydrateProfileViewBasic(ctx, getDidFromUri(v.uri), dataplane) // TO DO: Usar el dataplane
            if (!author) return null

            const status = getTopicVersionStatusFromReactions(
                ctx,
                v.reactions,
                editorStatusToEn(author.editorStatus),
                v.protection)

            const props = Array.isArray(v.props) ? v.props as unknown as ArCabildoabiertoWikiTopicVersion.TopicProp[] : []

            const view: ArCabildoabiertoWikiTopicVersion.VersionInHistory = {
                $type: "ar.cabildoabierto.wiki.topicVersion#versionInHistory",
                uri: v.uri,
                cid: v.cid,
                author: {
                    ...author,
                    $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
                },
                message: v.message,
                viewer,
                status: status,
                addedChars: v.charsAdded ?? undefined,
                removedChars: v.charsDeleted ?? undefined,
                props,
                createdAt: v.created_at_tz ? v.created_at_tz.toISOString() : v.created_at.toISOString(),
                contribution: {
                    monetized: (v.monetizedContribution ?? 0).toString(),
                    all: (v.charsContribution ?? 0).toString()
                },
                prevAccepted: v.prevAcceptedUri ?? undefined,
                claimsAuthorship: v.authorship ?? false,
                replyCount: v.replyCount ?? 0
            }
            return view
        }).filter(v => v != null)
    }
    return topicHistory
}

export const getTopicHistoryHandler: CAHandlerNoAuth<{
    params: { id: string }
}, ArCabildoabiertoWikiTopicVersion.TopicHistory> = async (ctx, agent, {params}) => {
    const {id} = params
    try {
        const topicHistory = await getTopicHistory(ctx, id, agent)
        return {data: topicHistory}
    } catch (e) {
        console.error("Error getting topic " + id)
        console.error(e)
        return {error: "No se pudo obtener el historial."}
    }
}
import {handleToDid} from "#/services/user/users.js";
import {getMainProfileFeedSkeleton} from "#/services/feed/profile/main.js";
import {getRepliesProfileFeedSkeleton} from "#/services/feed/profile/replies.js";
import {FeedPipelineProps, getFeed, GetFeedOutput} from "#/services/feed/feed.js";
import {getEditsProfileFeedSkeleton} from "#/services/feed/profile/edits.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {getArticlesProfileFeedSkeleton} from "#/services/feed/profile/articles.js";
import {ProfileFeedConfig} from "@cabildo-abierto/api";


export const getProfileFeed: CAHandlerNoAuth<{params: {handleOrDid: string, kind: ProfileFeedConfig["subtype"]}, query: {cursor?: string}}, GetFeedOutput> = async (ctx, agent, {params, query}) => {
    const {handleOrDid, kind} = params
    const {cursor} = query
    const did = await handleToDid(ctx, agent, handleOrDid)
    if(!did) return {error: "No se encontró el usuario."}

    let pipeline: FeedPipelineProps
    if(kind == "main"){
        pipeline = {
            getSkeleton: getMainProfileFeedSkeleton(did)
        }
    } else if(kind == "replies"){
        pipeline = {
            getSkeleton: getRepliesProfileFeedSkeleton(did)
        }
    } else if(kind == "edits") {
        pipeline = {
            getSkeleton: getEditsProfileFeedSkeleton(did)
        }
    } else if(kind == "articles") {
        pipeline = {
            getSkeleton: getArticlesProfileFeedSkeleton(did)
        }
    } else {
        return {error: "Feed inválido."}
    }

    return await getFeed({ctx, agent, pipeline, cursor})
}
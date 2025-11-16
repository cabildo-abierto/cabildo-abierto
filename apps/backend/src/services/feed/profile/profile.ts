import {handleToDid} from "#/services/user/users.js";
import {getMainProfileFeedSkeleton} from "#/services/feed/profile/main.js";
import {getRepliesProfileFeedSkeleton} from "#/services/feed/profile/replies.js";
import {FeedPipelineProps, getFeed, GetFeedOutput} from "#/services/feed/feed.js";
import {getEditsProfileFeedSkeleton} from "#/services/feed/profile/edits.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {filterFeed} from "#/services/feed/inicio/following.js";
import {getArticlesProfileFeedSkeleton} from "#/services/feed/profile/articles.js";


export const getProfileFeed: CAHandlerNoAuth<{params: {handleOrDid: string, kind: string}, query: {cursor?: string}}, GetFeedOutput> = async (ctx, agent, {params, query}) => {
    const {handleOrDid, kind} = params
    const {cursor} = query
    const did = await handleToDid(ctx, agent, handleOrDid)
    if(!did) return {error: "No se encontró el usuario."}

    let pipeline: FeedPipelineProps
    if(kind == "publicaciones"){
        pipeline = {
            getSkeleton: getMainProfileFeedSkeleton(did),
            filter: (ctx, f) => filterFeed(ctx, f, true)
        }
    } else if(kind == "respuestas"){
        pipeline = {
            getSkeleton: getRepliesProfileFeedSkeleton(did),
            filter: (ctx, f) => filterFeed(ctx, f, true)
        }
    } else if(kind == "ediciones") {
        pipeline = {
            getSkeleton: getEditsProfileFeedSkeleton(did)
        }
    } else if(kind == "articulos") {
        pipeline = {
            getSkeleton: getArticlesProfileFeedSkeleton(did)
        }
    } else {
        return {error: "Feed inválido."}
    }

    return await getFeed({ctx, agent, pipeline, cursor})
}
import {getMainProfileFeedSkeleton} from "#/services/feed/profile/main.js";
import {getRepliesProfileFeedSkeleton} from "#/services/feed/profile/replies.js";
import {FeedPipelineProps, getFeed} from "#/services/feed/feed.js";
import {getEditsProfileFeedSkeleton} from "#/services/feed/profile/edits.js";
import {EffHandlerNoAuth} from "#/utils/handler.js";
import {getArticlesProfileFeedSkeleton} from "#/services/feed/profile/articles.js";
import {ArCabildoabiertoFeedDefs, GetFeedOutput, ProfileFeedConfig} from "@cabildo-abierto/api";
import * as Effect from "effect/Effect";
import {handleOrDidToDid} from "#/id-resolver.js";
import {InvalidValueError} from "#/utils/errors.js";
import {UserNotFoundError} from "#/services/user/access.js";


export const getProfileFeed: EffHandlerNoAuth<{params: {handleOrDid: string, kind: ProfileFeedConfig["subtype"]}, query: {cursor?: string}}, GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>> = (
    ctx,
    agent,
    {params, query}
) => Effect.gen(function* () {
    const {handleOrDid, kind} = params
    const {cursor} = query

    const did = yield* handleOrDidToDid(ctx, handleOrDid)

    if(!did) {
        return yield* Effect.fail(new UserNotFoundError())
    }

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
        return yield* Effect.fail(new InvalidValueError(`Muro inválido: ${kind}`))
    }
    return yield* getFeed({ctx, agent, pipeline, cursor})
}).pipe(
    Effect.catchAll(() => {
        return Effect.fail("Ocurrió un error al obtener el muro.")
    })
)
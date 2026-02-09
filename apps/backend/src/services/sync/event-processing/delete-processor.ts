import {AppContext} from "#/setup.js";
import {Effect} from "effect";
import {getCollectionFromUri} from "@cabildo-abierto/utils";
import {RedisCacheSetError} from "#/services/redis/cache.js";
import {AddJobError, DBDeleteError} from "#/utils/errors.js";
import {NotImplementedError} from "#/services/thread/thread.js";
import {articleDeleteProcessor} from "#/services/sync/event-processing/article.js";
import {postDeleteProcessor} from "#/services/sync/event-processing/post.js";
import {followDeleteProcessor} from "#/services/sync/event-processing/follow.js";
import {caProfileDeleteProcessor} from "#/services/sync/event-processing/profile.js";
import {topicVersionDeleteProcessor} from "#/services/sync/event-processing/topic.js";
import {reactionDeleteProcessor} from "#/services/sync/event-processing/reaction.js";
import {pollVoteDeleteProcessor} from "#/services/sync/event-processing/poll-vote.js";
import {datasetDeleteProcessor} from "#/services/sync/event-processing/dataset.js";


export type ProcessDeleteError = RedisCacheSetError | DBDeleteError | NotImplementedError | AddJobError

export type DeleteProcessor = (ctx: AppContext, uris: string[]) => Effect.Effect<void, ProcessDeleteError>


const baseDeleteProcessor: DeleteProcessor = (ctx, uris) => {
    return Effect.tryPromise({
        try: () => ctx.kysely.deleteFrom("Record").where("uri", "in", uris).execute(),
        catch: () => new DBDeleteError()
    })
}


const collectionToProcessorMap: Record<string, DeleteProcessor> = {
    "ar.cabildoabierto.feed.article": articleDeleteProcessor,
    "ar.cabildoabierto.data.dataset": datasetDeleteProcessor,
    "app.bsky.feed.post": postDeleteProcessor,
    "app.bsky.actor.profile": baseDeleteProcessor,
    "app.bsky.graph.follow": followDeleteProcessor,
    "ar.cabildoabierto.actor.caProfile": caProfileDeleteProcessor,
    "ar.com.cabildoabierto.profile": caProfileDeleteProcessor,
    "ar.cabildoabierto.wiki.topicVersion": topicVersionDeleteProcessor,
    "app.bsky.feed.like": reactionDeleteProcessor,
    "app.bsky.feed.repost": reactionDeleteProcessor,
    "ar.cabildoabierto.wiki.voteAccept": reactionDeleteProcessor,
    "ar.cabildoabierto.wiki.voteReject": reactionDeleteProcessor,
    "ar.cabildoabierto.embed.pollVote": pollVoteDeleteProcessor,
}



export const processDeletes = (
    ctx: AppContext,
    uris: string[],
    batchSize: number = 5000
): Effect.Effect<void, ProcessDeleteError> => Effect.gen(function* () {
    const byCollection = new Map<string, string[]>()
    for(const uri of uris) {
        const c = getCollectionFromUri(uri)
        byCollection.set(c, [...(byCollection.get(c) ?? []), uri])
    }
    for(const [collection, uris] of byCollection.entries()) {
        const processor = collectionToProcessorMap[collection]
        if(!processor) {
            return yield* Effect.fail(new NotImplementedError(collection))
        }

        const batches: string[][] = []
        for (let i = 0; i < uris.length; i += batchSize) {batches.push(uris.slice(i, i+batchSize))}

        for(const b of batches){
            yield* processor(ctx, b).pipe(
                Effect.withSpan(`processDeletes ${collection}`, {attributes: {count: b.length}})
            )
        }
    }
    yield* Effect.tryPromise({
        try: () => ctx.redisCache.onDeleteRecords(uris),
        catch: () => new RedisCacheSetError()
    })
})



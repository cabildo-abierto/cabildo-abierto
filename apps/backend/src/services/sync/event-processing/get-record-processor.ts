import {
    bskyProfileProcessor,
    caProfileProcessor,
    oldCAProfileProcessor,
} from "#/services/sync/event-processing/profile.js";
import {
    likeProcessor,
    repostProcessor,
    voteAcceptProcessor,
    voteRejectProcessor
} from "#/services/sync/event-processing/reaction.js";
import {articleProcessor} from "#/services/sync/event-processing/article.js";
import {followProcessor} from "#/services/sync/event-processing/follow.js";
import {topicVersionProcessor} from "#/services/sync/event-processing/topic.js";
import {datasetProcessor} from "#/services/sync/event-processing/dataset.js";
import {postProcessor} from "#/services/sync/event-processing/post.js";
import {AppContext} from "#/setup.js";
import {pollVoteProcessor} from "#/services/sync/event-processing/poll-vote.js";
import {Effect} from "effect";
import {Processor} from "#/services/sync/event-processing/record-processor.js";


const emptyProcessor: Processor = {
    validator: (ctx, record) => {
        return Effect.succeed({success: true, value: record})
    },
    addRecordsToDB: () => {
        return Effect.succeed(0)
    }
}


export function getRecordProcessor(ctx: AppContext, collection: string): Processor {
    const processors: Record<string, Processor> = {
        "app.bsky.actor.profile": bskyProfileProcessor,
        "app.bsky.feed.like": likeProcessor,
        "ar.cabildoabierto.feed.article": articleProcessor,
        "app.bsky.feed.repost": repostProcessor,
        "app.bsky.graph.follow": followProcessor,
        "ar.cabildoabierto.actor.caProfile": caProfileProcessor,
        "ar.com.cabildoabierto.profile": oldCAProfileProcessor,
        "ar.cabildoabierto.wiki.topicVersion": topicVersionProcessor,
        "ar.cabildoabierto.wiki.voteAccept": voteAcceptProcessor,
        "ar.cabildoabierto.wiki.voteReject": voteRejectProcessor,
        "ar.cabildoabierto.data.dataset": datasetProcessor,
        "app.bsky.feed.post": postProcessor,
        "ar.cabildoabierto.embed.pollVote": pollVoteProcessor
    }
    return processors[collection] ?? emptyProcessor
}

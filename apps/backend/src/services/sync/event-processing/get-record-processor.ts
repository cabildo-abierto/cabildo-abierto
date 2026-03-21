import {RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {
    bskyProfileRecordProcessor,
    caProfileRecordProcessor,
    oldCAProfileRecordProcessor,
} from "#/services/sync/event-processing/profile.js";
import {
    likeRecordProcessor,
    repostRecordProcessor,
    voteAcceptRecordProcessor,
    voteRejectRecordProcessor
} from "#/services/sync/event-processing/reaction.js";
import {articleRecordProcessor} from "#/services/sync/event-processing/article.js";
import {followRecordProcessor} from "#/services/sync/event-processing/follow.js";
import {topicVersionRecordProcessor} from "#/services/sync/event-processing/topic.js";
import {datasetRecordProcessor} from "#/services/sync/event-processing/dataset.js";
import {postRecordProcessor} from "#/services/sync/event-processing/post.js";
import {AppContext} from "#/setup.js";
import {pollVoteRecordProcessor} from "#/services/sync/event-processing/poll-vote.js";
import {Effect} from "effect";


const emptyProcessor: RecordProcessor = {
    validator: (ctx, record) => {
        return Effect.succeed({success: true, value: record})
    },
    addRecordsToDB: (ctx, records, reprocess) => {
        return Effect.succeed(0)
    }
}


export function getRecordProcessor(ctx: AppContext, collection: string): RecordProcessor {
    const processors: Record<string, RecordProcessor> = {
        "app.bsky.actor.profile": bskyProfileRecordProcessor,
        "app.bsky.feed.like": likeRecordProcessor,
        "ar.cabildoabierto.feed.article": articleRecordProcessor,
        "app.bsky.feed.repost": repostRecordProcessor,
        "app.bsky.graph.follow": followRecordProcessor,
        "ar.cabildoabierto.actor.caProfile": caProfileRecordProcessor,
        "ar.com.cabildoabierto.profile": oldCAProfileRecordProcessor,
        "ar.cabildoabierto.wiki.topicVersion": topicVersionRecordProcessor,
        "ar.cabildoabierto.wiki.voteAccept": voteAcceptRecordProcessor,
        "ar.cabildoabierto.wiki.voteReject": voteRejectRecordProcessor,
        "ar.cabildoabierto.data.dataset": datasetRecordProcessor,
        "app.bsky.feed.post": postRecordProcessor,
        "ar.cabildoabierto.embed.pollVote": pollVoteRecordProcessor
    }
    return processors[collection] ?? emptyProcessor
}
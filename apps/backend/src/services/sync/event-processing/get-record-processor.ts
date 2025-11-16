import {RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {
    BskyProfileRecordProcessor,
    CAProfileRecordProcessor,
    OldCAProfileRecordProcessor
} from "#/services/sync/event-processing/profile.js";
import {
    LikeRecordProcessor,
    RepostRecordProcessor,
    VoteAcceptRecordProcessor,
    VoteRejectRecordProcessor
} from "#/services/sync/event-processing/reaction.js";
import {ArticleRecordProcessor} from "#/services/sync/event-processing/article.js";
import {FollowRecordProcessor} from "#/services/sync/event-processing/follow.js";
import {TopicVersionRecordProcessor} from "#/services/sync/event-processing/topic.js";
import {DatasetRecordProcessor} from "#/services/sync/event-processing/dataset.js";
import {PostRecordProcessor} from "#/services/sync/event-processing/post.js";
import {getCollectionFromUri} from "@cabildo-abierto/utils";
import {getDeleteProcessor} from "#/services/sync/event-processing/get-delete-processor.js";
import {AppContext} from "#/setup.js";

type RecordProcessorConstructor = new (ctx: AppContext) => RecordProcessor<any>;

const collectionToProcessorMap: Record<string, RecordProcessorConstructor> = {
    "app.bsky.actor.profile": BskyProfileRecordProcessor,
    "app.bsky.feed.like": LikeRecordProcessor,
    "ar.cabildoabierto.feed.article": ArticleRecordProcessor,
    "app.bsky.feed.repost": RepostRecordProcessor,
    "app.bsky.graph.follow": FollowRecordProcessor,
    "ar.cabildoabierto.actor.caProfile": CAProfileRecordProcessor,
    "ar.com.cabildoabierto.profile": OldCAProfileRecordProcessor,
    "ar.cabildoabierto.wiki.topicVersion": TopicVersionRecordProcessor,
    "ar.cabildoabierto.wiki.voteAccept": VoteAcceptRecordProcessor,
    "ar.cabildoabierto.wiki.voteReject": VoteRejectRecordProcessor,
    "ar.cabildoabierto.data.dataset": DatasetRecordProcessor,
    "app.bsky.feed.post": PostRecordProcessor
}


export function getRecordProcessor(ctx: AppContext, collection: string) {
    const processor = collectionToProcessorMap[collection]

    if (processor) {
        return new processor(ctx)
    } else {
        return new RecordProcessor(ctx)
    }
}

export async function batchDeleteRecords(ctx: AppContext, uris: string[]) {
    const byCollections = new Map<string, string[]>()
    uris.forEach(r => {
        const c = getCollectionFromUri(r)
        byCollections.set(c, [...(byCollections.get(c) ?? []), r])
    })
    const entries = Array.from(byCollections.entries())
    for (let i = 0; i < entries.length; i++) {
        const [c, uris] = entries[i]
        ctx.logger.pino.info({c}, "deleting batch of records")
        await getDeleteProcessor(ctx, c).processInBatches(uris)
    }
}
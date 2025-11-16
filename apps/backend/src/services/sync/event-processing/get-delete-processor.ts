import {AppContext} from "#/setup.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {ArticleDeleteProcessor} from "#/services/sync/event-processing/article.js";
import {DatasetDeleteProcessor} from "#/services/sync/event-processing/dataset.js";
import {PostDeleteProcessor} from "#/services/sync/event-processing/post.js";
import {FollowDeleteProcessor} from "#/services/sync/event-processing/follow.js";
import {CAProfileDeleteProcessor} from "#/services/sync/event-processing/profile.js";
import {TopicVersionDeleteProcessor} from "#/services/sync/event-processing/topic.js";
import {ReactionDeleteProcessor} from "#/services/sync/event-processing/reaction.js";

export function getDeleteProcessor(ctx: AppContext, collection: string) {
    const processor = collectionToProcessorMap[collection]

    if (processor) {
        return new processor(ctx)
    } else {
        ctx.logger.pino.warn({collection}, "delete processor not found")
        return new DeleteProcessor(ctx)
    }
}

type RecordProcessorConstructor = new (ctx: AppContext) => DeleteProcessor;
const collectionToProcessorMap: Record<string, RecordProcessorConstructor> = {
    "ar.cabildoabierto.feed.article": ArticleDeleteProcessor,
    "ar.cabildoabierto.data.dataset": DatasetDeleteProcessor,
    "app.bsky.feed.post": PostDeleteProcessor,
    "app.bsky.actor.profile": DeleteProcessor,
    "app.bsky.graph.follow": FollowDeleteProcessor,
    "ar.cabildoabierto.actor.caProfile": CAProfileDeleteProcessor,
    "ar.com.cabildoabierto.profile": CAProfileDeleteProcessor,
    "ar.cabildoabierto.wiki.topicVersion": TopicVersionDeleteProcessor,
    "app.bsky.feed.like": ReactionDeleteProcessor,
    "app.bsky.feed.repost": ReactionDeleteProcessor,
    "ar.cabildoabierto.wiki.voteAccept": ReactionDeleteProcessor,
    "ar.cabildoabierto.wiki.voteReject": ReactionDeleteProcessor,
}
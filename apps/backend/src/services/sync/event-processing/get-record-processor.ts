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
import {AppContext} from "#/setup.js";
import {PollVoteRecordProcessor} from "#/services/sync/event-processing/poll-vote.js";


export function getRecordProcessor(ctx: AppContext, collection: string) {
    const processor = {
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
        "app.bsky.feed.post": PostRecordProcessor,
        "ar.cabildoabierto.embed.pollVote": PollVoteRecordProcessor
    }[collection]

    if (processor) {
        return new processor(ctx)
    } else {
        return new RecordProcessor(ctx)
    }
}
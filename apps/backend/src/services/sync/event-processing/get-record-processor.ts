import {Processing} from "#/services/record/processing.js";
import {
    caProfileRecordProcessor,
} from "#/services/sync/event-processing/profile.js";
import {
    wikiVoteRecordProcessor
} from "#/services/sync/event-processing/reaction.js";
import {topicRecordProcessor} from "#/services/sync/event-processing/topic.js";
import {datasetRecordProcessor} from "#/services/sync/event-processing/dataset.js";
import {AppContext} from "#/setup.js";
import {pollVoteRecordProcessor} from "#/services/sync/event-processing/poll-vote.js";
import {Effect} from "effect";


const emptyProcessor: Processing = {
    validator: (ctx, record) => {
        return Effect.succeed({success: true, value: record})
    },
    addRecordsToDB: (ctx, records, reprocess) => {
        return Effect.succeed(0)
    }
}


export function getRecordProcessor(ctx: AppContext, collection: string): Processing {
    const processors: Record<string, Processing> = {
        "ar.cabildoabierto.actor.caProfile": caProfileRecordProcessor,
        "ar.cabildoabierto.wiki.topic": topicRecordProcessor,
        "ar.cabildoabierto.wiki.vote": wikiVoteRecordProcessor,
        "ar.cabildoabierto.data.dataset": datasetRecordProcessor,
        "ar.cabildoabierto.embed.pollVote": pollVoteRecordProcessor
    }
    return processors[collection] ?? emptyProcessor
}
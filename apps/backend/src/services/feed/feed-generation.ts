import { InvalidRequestError } from '@atproto/xrpc-server'
import { AtUri } from '@atproto/syntax'
import { Server } from "#/server/index.js"
import {AppContext} from "#/setup.js";

/*
export default function feedGeneration(server: Server, ctx: AppContext) {
    server.app.bsky.feed.getFeedSkeleton(async ({ params, req }) => {
        const feedUri = new AtUri(params.feed)
        const algo = algos[feedUri.rkey]
        if (
            feedUri.hostname !== ctx.cfg.publisherDid ||
            feedUri.collection !== 'app.bsky.feed.generator' ||
            !algo
        ) {
            throw new InvalidRequestError(
                'Unsupported algorithm',
                'UnsupportedAlgorithm',
            )
        }

        const body = await algo(ctx, params)
        return {
            encoding: 'application/json',
            body: body,
        }
    })
}
*/
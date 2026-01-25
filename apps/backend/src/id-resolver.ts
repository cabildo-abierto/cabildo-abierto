import {IdResolver, MemoryCache} from '@atproto/identity'
import {RedisCache} from "#/services/redis/cache.js";
import {pipe} from "effect";
import {HandleResolutionError} from "#/services/user/users.js";
import {AppContext} from "#/setup.js";
import * as Effect from "effect/Effect";

const HOUR = 60e3 * 60
const DAY = HOUR * 24


export function createIdResolver() {
    return new IdResolver({
        didCache: new MemoryCache(HOUR, DAY),
    })
}

export interface BidirectionalResolver {
    resolveHandleToDid(handle: string): Effect.Effect<string, HandleResolutionError>

    resolveDidToHandle(did: string, useCache: boolean): Promise<string>
}

export function createBidirectionalResolver(resolver: IdResolver, redis: RedisCache): BidirectionalResolver {
    return {
        async resolveDidToHandle(did: string, useCache: boolean = true): Promise<string> {
            const handle = await redis.resolver.getHandle(did)
            if(!handle || !useCache){
                const didDoc = await resolver.did.resolveAtprotoData(did)
                const resolvedHandle = await resolver.handle.resolve(didDoc.handle)
                if (resolvedHandle === did) {
                    await redis.resolver.setHandle(did, didDoc.handle)
                    return didDoc.handle
                }
                throw new Error("Could not resolve handle for did.")
            } else {
                return handle
            }
        },

        resolveHandleToDid(handle: string): Effect.Effect<string, HandleResolutionError> {
            return pipe(
                Effect.promise(() => redis.resolver.getDid(handle)),
                Effect.flatMap(did => {
                    return did ?
                        Effect.succeed(did) :
                        Effect.promise(() => resolver.handle.resolveDns(handle))
                }),
                Effect.flatMap(did => {
                    return did ?
                        Effect.succeed(did) :
                        Effect.promise(() => resolver.handle.resolveHttp(handle))
                }),
                Effect.tap(did =>  {
                    return did ? Effect.promise(() => redis.resolver.setHandle(did, handle)) : Effect.void
                }),
                Effect.flatMap(did => {
                    return did ?
                        Effect.succeed(did) :
                        Effect.fail(new HandleResolutionError())
                }),
                Effect.catchAll(error => Effect.fail(new HandleResolutionError())),
                Effect.withSpan("resolveHandleToDid", {
                    attributes: {handle}
                })
            )
        }
    }
}

export const handleOrDidToDid = (ctx: AppContext, handleOrDid: string): Effect.Effect<string, HandleResolutionError> => {
    if (handleOrDid.startsWith("did")) {
        return Effect.succeed(handleOrDid)
    } else {
        return ctx.resolver.resolveHandleToDid(handleOrDid)
    }
}
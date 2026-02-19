import {IdResolver, MemoryCache} from '@atproto/identity'
import {RedisCache, RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
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

    resolveDidToHandle(did: string, useCache: boolean): Effect.Effect<string, HandleResolutionError>
}

export function createBidirectionalResolver(resolver: IdResolver, redis: RedisCache): BidirectionalResolver {
    return {
        resolveDidToHandle(did: string, useCache: boolean = true): Effect.Effect<string, HandleResolutionError> {
            return Effect.gen(function* () {
                const handle = yield* Effect.tryPromise({
                    try: () => redis.resolver.getHandle(did),
                    catch: () => new RedisCacheFetchError()
                }).pipe(Effect.orElseSucceed(() => null))

                if(!handle || !useCache){
                    const didDoc = yield* Effect.tryPromise({
                        try: () => resolver.did.resolveAtprotoData(did),
                        catch: () => new HandleResolutionError()
                    })
                    const resolvedHandle = yield* Effect.tryPromise({
                        try: () => resolver.handle.resolve(didDoc.handle),
                        catch: () => new HandleResolutionError()
                    })
                    if (resolvedHandle === did) {
                        yield* Effect.tryPromise({
                            try: () => redis.resolver.setHandle(did, didDoc.handle),
                            catch: () => new RedisCacheSetError()
                        }).pipe(Effect.orElseSucceed(() => null))

                        return didDoc.handle
                    }
                    return yield* Effect.fail(new HandleResolutionError())
                } else {
                    return handle
                }
            })
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
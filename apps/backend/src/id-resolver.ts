import {IdResolver, MemoryCache} from '@atproto/identity'
import {RedisCache, RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
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
    resolveHandleToDid(handle: string): Effect.Effect<string | null, HandleResolutionError | RedisCacheFetchError | RedisCacheSetError>

    resolveDidToHandle(did: string, useCache: boolean): Effect.Effect<string, HandleResolutionError>

    resolveHandleToDidDNS(handle: string): Effect.Effect<string | null, HandleResolutionError>
    resolveHandleToDidHTTP(handle: string): Effect.Effect<string | null, HandleResolutionError>
}

export function createBidirectionalResolver(resolver: IdResolver, redis: RedisCache): BidirectionalResolver {
    return {
        resolveHandleToDidDNS(handle: string) {
            return Effect.tryPromise({
                try: () => resolver.handle.resolveDns(handle).then(x => x ?? null),
                catch: (e) => new HandleResolutionError(e)
            })
        },
        resolveHandleToDidHTTP(handle: string) {
            return Effect.tryPromise({
                try: () => resolver.handle.resolveHttp(handle).then(x => x ?? null),
                catch: (e) => new HandleResolutionError(e)
            })
        },
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

        resolveHandleToDid(handle: string): Effect.Effect<string | null, HandleResolutionError | RedisCacheFetchError | RedisCacheSetError> {
            return Effect.gen(function* () {
                let did = yield* Effect.tryPromise({
                    try: () => redis.resolver.getDid(handle),
                    catch: () => new RedisCacheFetchError()
                })
                if(!did) {
                    did = (yield* Effect.tryPromise({
                        try: () => resolver.handle.resolveDns(handle),
                        catch: () => new HandleResolutionError()
                    })) ?? null
                }
                if(!did) {
                    did = (yield* Effect.tryPromise({
                        try: () => resolver.handle.resolveHttp(handle),
                        catch: () => new HandleResolutionError()
                    })) ?? null
                }
                if(did) {
                    yield* Effect.tryPromise({
                        try: () => redis.resolver.setHandle(did, handle),
                        catch: () => new RedisCacheSetError()
                    })
                }
                return did ?? null
            }).pipe(
                Effect.withSpan("resolveHandleToDid", {attributes: {handle}})
            )
        }
    }
}

export const handleOrDidToDid = (ctx: AppContext, handleOrDid: string): Effect.Effect<string | null, HandleResolutionError | RedisCacheSetError | RedisCacheFetchError> => {
    if (handleOrDid.startsWith("did")) {
        return Effect.succeed(handleOrDid)
    } else {
        return ctx.resolver.resolveHandleToDid(handleOrDid)
    }
}
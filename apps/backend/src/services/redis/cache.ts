import {
    isCAProfile,
    isFollow,
    splitUri
} from "@cabildo-abierto/utils";
import { FollowingFeedSkeletonElement } from "#/services/feed/inicio/following.js";
import { ArCabildoabiertoActorDefs } from "@cabildo-abierto/api";
import { RefAndRecord } from "#/services/sync/types.js";
import { AppBskyGraphFollow } from "@atproto/api";
import { NextMeeting } from "#/services/admin/meetings.js";
import { type Redis } from "ioredis/built/index.js";
import { Context, Effect, Layer } from "effect";

// Error types
export class RedisCacheFetchError {
    readonly _tag = "RedisCacheFetchError";
}

export class RedisCacheSetError {
    readonly _tag = "RedisCacheSetError";
}

export type MirrorStatus =
    | "Sync"
    | "Dirty"
    | "InProcess"
    | "Failed"
    | "Failed - Too Large";

export type RedisEvent =
    | "verification-update"
    | "follow-suggestions-ready"
    | "follow-suggestions-dirty";

// Service interface
export class RedisCache extends Context.Tag("RedisCache")<
    RedisCache,
    {
        // Profile operations
        readonly profile: {
            readonly get: (
                did: string
            ) => Effect.Effect<
                ArCabildoabiertoActorDefs.ProfileViewDetailed | null,
                RedisCacheFetchError
            >;
            readonly getMany: (
                dids: string[]
            ) => Effect.Effect<
                (ArCabildoabiertoActorDefs.ProfileViewDetailed | null)[],
                RedisCacheFetchError
            >;
            readonly set: (
                did: string,
                profile: ArCabildoabiertoActorDefs.ProfileViewDetailed
            ) => Effect.Effect<void, RedisCacheSetError>;
            readonly setMany: (
                profiles: ArCabildoabiertoActorDefs.ProfileViewDetailed[]
            ) => Effect.Effect<void, RedisCacheSetError>;
            readonly clear: () => Effect.Effect<void, never>;
        };

        // Mirror status operations
        readonly mirrorStatus: {
            readonly get: (
                did: string,
                inCA: boolean
            ) => Effect.Effect<MirrorStatus, RedisCacheFetchError>;
            readonly set: (
                did: string,
                status: MirrorStatus,
                inCA: boolean
            ) => Effect.Effect<void, RedisCacheSetError>;
            readonly clear: () => Effect.Effect<void, never>;
        };

        // CA Follows operations
        readonly CAFollows: {
            readonly get: (
                did: string
            ) => Effect.Effect<string[] | null, RedisCacheFetchError>;
            readonly set: (
                did: string,
                follows: string[]
            ) => Effect.Effect<void, RedisCacheSetError>;
            readonly clear: () => Effect.Effect<void, never>;
        };

        // Follow suggestions operations
        readonly followSuggestions: {
            readonly get: (
                did: string
            ) => Effect.Effect<string[] | null, RedisCacheFetchError>;
            readonly set: (
                did: string,
                dids: string[]
            ) => Effect.Effect<void, RedisCacheSetError>;
            readonly getDirty: () => Effect.Effect<string[], RedisCacheFetchError>;
            readonly setDirty: (did: string) => Effect.Effect<void, RedisCacheSetError>;
            readonly setReady: (did: string) => Effect.Effect<void, RedisCacheSetError>;
        };

        // Following feed skeleton operations
        readonly followingFeedSkeleton: {
            readonly get: (
                did: string,
                params: string[],
                score: number | null,
                limit: number
            ) => Effect.Effect<string[], RedisCacheFetchError>;
            readonly add: (
                did: string,
                params: string[],
                elements: ({ score: number } & FollowingFeedSkeletonElement)[]
            ) => Effect.Effect<void, RedisCacheSetError>;
            readonly clear: () => Effect.Effect<void, never>;
        };

        // DID/Handle resolver operations
        readonly resolver: {
            readonly getHandle: (
                did: string
            ) => Effect.Effect<string | null, RedisCacheFetchError>;
            readonly getDid: (
                handle: string
            ) => Effect.Effect<string | null, RedisCacheFetchError>;
            readonly setHandle: (
                did: string,
                handle: string
            ) => Effect.Effect<void, RedisCacheSetError>;
        };

        // Next meeting operations
        readonly nextMeeting: {
            readonly get: () => Effect.Effect<NextMeeting | null, RedisCacheFetchError>;
            readonly set: (meeting: NextMeeting) => Effect.Effect<void, RedisCacheSetError>;
        };

        // Global cache operations
        readonly onUpdateRecords: (
            records: RefAndRecord<any>[]
        ) => Effect.Effect<void, never>;
        readonly onDeleteRecords: (uris: string[]) => Effect.Effect<void, never>;
        readonly onEvent: (
            e: RedisEvent,
            params: string[]
        ) => Effect.Effect<void, never>;
        readonly clear: () => Effect.Effect<void, never>;
        readonly deleteByPrefix: (prefix: string) => Effect.Effect<void, never>;
        readonly getKeysByPrefix: (
            prefix: string
        ) => Effect.Effect<string[], RedisCacheFetchError>;
    }
>() {}

// Helper functions
const formatCachedProfile = (
    p: string | null
): ArCabildoabiertoActorDefs.ProfileViewDetailed | null => {
    if (p == null) return null;
    const profile: ArCabildoabiertoActorDefs.ProfileViewDetailed = JSON.parse(p);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { viewer, ...profileNoViewer } = profile;
    return profileNoViewer;
};

const buildFollowingFeedSkeletonKey = (did: string, params: string[]) => {
    return ["following-feed-skeleton", did, ...params].join(":");
};

const buildProfileKey = (did: string) => `profile-detailed:${did}`;
const buildCAFollowsKey = (did: string) => `ca-follows:${did}`;
const buildFollowSuggestionsKey = (did: string) => `follow-suggestions:${did}`;
const buildMirrorStatusKey = (did: string, inCA: boolean, mirrorId: string) =>
    `${mirrorId}:mirror-status:${did}:${inCA ? "ca" : "ext"}`;
const buildDidToHandleKey = (did: string) => `did->handle:${did}`;
const buildHandleToDidKey = (handle: string) => `handle->did:${handle}`;

// Implementation
export const RedisCacheLive = (redis: Redis, mirrorId: string) =>
    Layer.succeed(
        RedisCache,
        RedisCache.of({
            // Profile operations
            profile: {
                get: (did: string) =>
                    Effect.tryPromise({
                        try: async () => {
                            const cached = await redis.get(buildProfileKey(did));
                            return formatCachedProfile(cached);
                        },
                        catch: () => new RedisCacheFetchError(),
                    }),

                getMany: (dids: string[]) => {
                    // Cache desactivada
                    return Effect.succeed(dids.map(() => null));
                },

                set: (did: string, profile: ArCabildoabiertoActorDefs.ProfileViewDetailed) =>
                    Effect.tryPromise({
                        try: () => redis.set(buildProfileKey(did), JSON.stringify(profile)),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),

                setMany: (profiles: ArCabildoabiertoActorDefs.ProfileViewDetailed[]) =>
                    Effect.tryPromise({
                        try: async () => {
                            const pipeline = redis.pipeline();
                            profiles.forEach((p) => {
                                pipeline.set(buildProfileKey(p.did), JSON.stringify(p));
                            });
                            await pipeline.exec();
                        },
                        catch: () => new RedisCacheSetError(),
                    }),

                clear: () =>
                    Effect.promise(() => deleteByPrefixImpl(redis, "profile-detailed")),
            },

            // Mirror status operations
            mirrorStatus: {
                get: (did: string, inCA: boolean) =>
                    Effect.tryPromise({
                        try: () => redis.get(buildMirrorStatusKey(did, inCA, mirrorId)),
                        catch: () => new RedisCacheFetchError(),
                    }).pipe(
                        Effect.map((res) => (res ? (res as MirrorStatus) : "Dirty"))
                    ),

                set: (did: string, status: MirrorStatus, inCA: boolean) =>
                    Effect.tryPromise({
                        try: () =>
                            redis.set(buildMirrorStatusKey(did, inCA, mirrorId), status),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),

                clear: () =>
                    Effect.promise(() =>
                        deleteByPrefixImpl(redis, `${mirrorId}:mirror-status`)
                    ),
            },

            // CA Follows operations
            CAFollows: {
                get: (did: string) =>
                    Effect.tryPromise({
                        try: async () => {
                            const cached = await redis.get(buildCAFollowsKey(did));
                            return cached ? JSON.parse(cached) : null;
                        },
                        catch: () => new RedisCacheFetchError(),
                    }),

                set: (did: string, follows: string[]) =>
                    Effect.tryPromise({
                        try: () =>
                            redis.set(
                                buildCAFollowsKey(did),
                                JSON.stringify(follows),
                                "EX",
                                60 * 5
                            ),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),

                clear: () =>
                    Effect.promise(() => deleteByPrefixImpl(redis, "ca-follows")),
            },

            // Follow suggestions operations
            followSuggestions: {
                get: (did: string) =>
                    Effect.tryPromise({
                        try: async () => {
                            const res = await redis.get(buildFollowSuggestionsKey(did));
                            return res ? JSON.parse(res) : null;
                        },
                        catch: () => new RedisCacheFetchError(),
                    }),

                set: (did: string, dids: string[]) =>
                    Effect.tryPromise({
                        try: () =>
                            redis.set(buildFollowSuggestionsKey(did), JSON.stringify(dids)),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),

                getDirty: () =>
                    Effect.tryPromise({
                        try: async () => {
                            const dirty = await redis.smembers("follow-suggestions-dirty");
                            const keys: string[] = await redis.keys(`follow-suggestions:*`);
                            const requested = new Set(
                                keys.map((k) => k.replace("follow-suggestions:", ""))
                            );
                            return dirty.filter((did: string) => requested.has(did));
                        },
                        catch: () => new RedisCacheFetchError(),
                    }),

                setDirty: (did: string) =>
                    Effect.tryPromise({
                        try: () => redis.sadd("follow-suggestions-dirty", did),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),

                setReady: (did: string) =>
                    Effect.tryPromise({
                        try: () => redis.srem("follow-suggestions-dirty", did),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),
            },

            // Following feed skeleton operations
            followingFeedSkeleton: {
                get: (
                    did: string,
                    params: string[],
                    score: number | null,
                    limit: number
                ) =>
                    Effect.tryPromise({
                        try: () => {
                            const max = score != null ? score - 1 : "+inf";
                            return redis.zrevrangebyscore(
                                buildFollowingFeedSkeletonKey(did, params),
                                max,
                                "-inf",
                                "WITHSCORES",
                                "LIMIT",
                                0,
                                limit
                            );
                        },
                        catch: () => new RedisCacheFetchError(),
                    }),

                add: (
                    did: string,
                    params: string[],
                    elements: ({ score: number } & FollowingFeedSkeletonElement)[]
                ) =>
                    Effect.tryPromise({
                        try: () =>
                            redis.zadd(
                                buildFollowingFeedSkeletonKey(did, params),
                                ...elements.flatMap(({ score, ...r }) => [
                                    score,
                                    JSON.stringify(r),
                                ])
                            ),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),

                clear: () =>
                    Effect.promise(() =>
                        deleteByPrefixImpl(redis, "following-feed-skeleton")
                    ),
            },

            // Resolver operations
            resolver: {
                getHandle: (did: string) =>
                    Effect.tryPromise({
                        try: () => redis.get(buildDidToHandleKey(did)),
                        catch: () => new RedisCacheFetchError(),
                    }),

                getDid: (handle: string) =>
                    Effect.tryPromise({
                        try: () => redis.get(buildHandleToDidKey(handle)),
                        catch: () => new RedisCacheFetchError(),
                    }),

                setHandle: (did: string, handle: string) =>
                    Effect.tryPromise({
                        try: async () => {
                            await redis.set(buildDidToHandleKey(did), handle, "EX", 3600);
                            await redis.set(buildHandleToDidKey(handle), did, "EX", 3600);
                        },
                        catch: () => new RedisCacheSetError(),
                    }),
            },

            // Next meeting operations
            nextMeeting: {
                get: () =>
                    Effect.tryPromise({
                        try: async () => {
                            const res = await redis.get("next-meeting");
                            return res ? JSON.parse(res) : null;
                        },
                        catch: () => new RedisCacheFetchError(),
                    }),

                set: (meeting: NextMeeting) =>
                    Effect.tryPromise({
                        try: () =>
                            redis.set("next-meeting", JSON.stringify(meeting), "EX", 60 * 60),
                        catch: () => new RedisCacheSetError(),
                    }).pipe(Effect.asVoid),
            },

            // Global operations
            onUpdateRecords: (records: RefAndRecord<any>[]) =>
                Effect.gen(function* () {
                    // Handle profile updates
                    const profileDidsToDelete = new Set<string>();
                    const caFollowDidsToDelete = new Set<string>();
                    const followSuggestionDidsToMarkDirty = new Set<string>();

                    for (const r of records) {
                        const { did, collection, rkey } = splitUri(r.ref.uri);

                        if (collection === "app.bsky.actor.profile" && rkey === "self") {
                            profileDidsToDelete.add(did);
                        } else if (isCAProfile(collection)) {
                            profileDidsToDelete.add(did);
                        } else if (isFollow(collection)) {
                            profileDidsToDelete.add(did);
                            const follow: AppBskyGraphFollow.Record = r.record;
                            profileDidsToDelete.add(follow.subject);
                            caFollowDidsToDelete.add(did);
                            followSuggestionDidsToMarkDirty.add(did);
                        }
                    }

                    // Delete profile keys
                    if (profileDidsToDelete.size > 0) {
                        yield* Effect.promise(() => {
                            const pipeline = redis.pipeline();
                            profileDidsToDelete.forEach((did) =>
                                pipeline.del(buildProfileKey(did))
                            );
                            return pipeline.exec();
                        });
                    }

                    // Delete CA follows keys
                    if (caFollowDidsToDelete.size > 0) {
                        yield* Effect.promise(() => {
                            const pipeline = redis.pipeline();
                            caFollowDidsToDelete.forEach((did) =>
                                pipeline.del(buildCAFollowsKey(did))
                            );
                            return pipeline.exec();
                        });
                    }

                    // Mark follow suggestions as dirty
                    if (followSuggestionDidsToMarkDirty.size > 0) {
                        yield* Effect.promise(() =>
                            redis.sadd(
                                "follow-suggestions-dirty",
                                ...Array.from(followSuggestionDidsToMarkDirty)
                            )
                        );
                    }
                }),

            onDeleteRecords: (uris: string[]) =>
                Effect.gen(function* () {
                    const profileDidsToDelete = new Set<string>();
                    const caFollowDidsToDelete = new Set<string>();
                    const followSuggestionDidsToMarkDirty = new Set<string>();

                    for (const uri of uris) {
                        const { did, collection, rkey } = splitUri(uri);

                        if (collection === "app.bsky.actor.profile" && rkey === "self") {
                            profileDidsToDelete.add(did);
                        } else if (isCAProfile(collection)) {
                            profileDidsToDelete.add(did);
                        } else if (isFollow(collection)) {
                            profileDidsToDelete.add(did);
                            caFollowDidsToDelete.add(did);
                            followSuggestionDidsToMarkDirty.add(did);
                        }
                    }

                    // Delete profile keys
                    if (profileDidsToDelete.size > 0) {
                        yield* Effect.promise(() => {
                            const pipeline = redis.pipeline();
                            profileDidsToDelete.forEach((did) =>
                                pipeline.del(buildProfileKey(did))
                            );
                            return pipeline.exec();
                        });
                    }

                    // Delete CA follows keys
                    if (caFollowDidsToDelete.size > 0) {
                        yield* Effect.promise(() => {
                            const pipeline = redis.pipeline();
                            caFollowDidsToDelete.forEach((did) =>
                                pipeline.del(buildCAFollowsKey(did))
                            );
                            return pipeline.exec();
                        });
                    }

                    // Mark follow suggestions as dirty
                    if (followSuggestionDidsToMarkDirty.size > 0) {
                        yield* Effect.promise(() =>
                            redis.sadd(
                                "follow-suggestions-dirty",
                                ...Array.from(followSuggestionDidsToMarkDirty)
                            )
                        );
                    }
                }),

            onEvent: (e: RedisEvent, params: string[]) =>
                Effect.gen(function* () {
                    if (params.length === 1) {
                        const did = params[0];

                        if (e === "verification-update") {
                            yield* Effect.promise(() => redis.del(buildProfileKey(did)));
                        } else if (e === "follow-suggestions-ready") {
                            yield* Effect.promise(() =>
                                redis.srem("follow-suggestions-dirty", did)
                            );
                        } else if (e === "follow-suggestions-dirty") {
                            yield* Effect.promise(() => redis.sadd("follow-suggestions-dirty", did));
                        }
                    }
                }),

            clear: () =>
                Effect.gen(function* () {
                    yield* Effect.promise(() => deleteByPrefixImpl(redis, "profile-detailed"));
                    yield* Effect.promise(() => deleteByPrefixImpl(redis, "ca-follows"));
                    yield* Effect.promise(() =>
                        deleteByPrefixImpl(redis, "following-feed-skeleton")
                    );
                }),

            deleteByPrefix: (prefix: string) =>
                Effect.promise(() => deleteByPrefixImpl(redis, prefix)),

            getKeysByPrefix: (prefix: string) =>
                Effect.tryPromise({
                    try: () => redis.keys(`${prefix}*`),
                    catch: () => new RedisCacheFetchError(),
                }),
        })
    );

// Helper implementation for deleteByPrefix
async function deleteByPrefixImpl(redis: Redis, prefix: string): Promise<void> {
    const stream = redis.scanStream({
        match: `${prefix}*`,
        count: 100,
    });

    return new Promise((resolve, reject) => {
        stream.on("data", async (keys) => {
            if (keys.length) {
                const pipeline = redis.pipeline();
                keys.forEach((key: string) => pipeline.del(key));
                await pipeline.exec();
            }
        });

        stream.on("end", () => resolve());
        stream.on("error", (err) => reject(err));
    });
}

// Convenience functions for common operations
export const getProfile = (did: string) =>
    Effect.gen(function* () {
        const cache = yield* RedisCache;
        return yield* cache.profile.get(did);
    });

export const setProfile = (
    did: string,
    profile: ArCabildoabiertoActorDefs.ProfileViewDetailed
) =>
    Effect.gen(function* () {
        const cache = yield* RedisCache;
        return yield* cache.profile.set(did, profile);
    });

export const getMirrorStatus = (did: string, inCA: boolean) =>
    Effect.gen(function* () {
        const cache = yield* RedisCache;
        return yield* cache.mirrorStatus.get(did, inCA);
    });

export const setMirrorStatus = (
    did: string,
    status: MirrorStatus,
    inCA: boolean
) =>
    Effect.gen(function* () {
        const cache = yield* RedisCache;
        return yield* cache.mirrorStatus.set(did, status, inCA);
    });

// Example usage:
/*
const program = Effect.gen(function* () {
  const cache = yield* RedisCache;

  // Get a profile
  const profile = yield* cache.profile.get("did:example:123");

  // Set mirror status
  yield* cache.mirrorStatus.set("did:example:123", "Sync", true);

  // Handle record updates
  yield* cache.onUpdateRecords(records);
});

// Run with the layer
const runnable = program.pipe(
  Effect.provide(RedisCacheLive(redisClient, "mirror-1"))
);

Effect.runPromise(runnable);
*/
import {getCollectionFromUri, getDidFromUri, isCAProfile, isFollow, splitUri, unique} from "@cabildo-abierto/utils";
import {FollowingFeedSkeletonElement} from "#/services/feed/inicio/following.js";
import {CAHandler} from "#/utils/handler.js";
import {Logger} from "#/utils/logger.js";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api";
import {RefAndRecord} from "#/services/sync/types.js";
import {AppBskyGraphFollow} from "@atproto/api";
import {NextMeeting} from "#/services/admin/meetings.js";
import {AppContext} from "#/setup.js";
import {type Redis} from "ioredis/built/index.js";
import {Effect} from "effect";


class CacheKey {
    cache: RedisCache

    constructor(cache: RedisCache) {
        this.cache = cache
    }

    async onUpdateRecord(r: RefAndRecord<any>) {

    }

    async onDeleteRecord(uri: string) {

    }

    async onDeleteRecords(uris: string[]) {
        for(const r of uris) {
            await this.onDeleteRecord(r)
        }
    }

    async onUpdateRecords(records: RefAndRecord<any>[]) {
        for(const r of records) {
            await this.onUpdateRecord(r)
        }
    }

    async onEvent(e: RedisEvent, params: string[]) {

    }

    buildKey(params: string[]) {
        return params.join(":")
    }

    async clear() {

    }
}


export class RedisCacheFetchError {
    readonly _tag = "RedisCacheFetchError"
}


export class RedisCacheSetError {
    readonly _tag = "RedisCacheSetError"
}


class ProfileCacheKey extends CacheKey {
    // Se actualiza si:
    // Cambia el record del perfil de Bluesky o Cabildo Abierto
    // Se verifica al usuario
    // Cambia el nivel de edicion del usuario (todavía no)
    // Alguien sigue al usuario o el usuario sigue a alguien

    async onUpdateRecord(r: RefAndRecord<any>) {
        // TO DO: Hacer en pipeline para muchos records
        const {did, collection, rkey} = splitUri(r.ref.uri)
        if(collection == "app.bsky.actor.profile" && rkey == "self"){
            await this.del(did)
        } else if(isCAProfile(collection)){
            await this.del(did)
        } else if(isFollow(collection)){
            await this.del(did)
            const follow: AppBskyGraphFollow.Record = r.record
            await this.del(follow.subject)
        }
    }

    async onDeleteRecord(uri: string) {
        const {did, collection, rkey} = splitUri(uri)
        if(collection == "app.bsky.actor.profile" && rkey == "self"){
            await this.del(did)
        } else if(isCAProfile(collection)) {
            await this.del(did)
        } else if(isFollow(collection)){
            await this.del(did)
        }
    }

    private del(did: string) {
        return this.cache.redis.del(this.key(did))
    }

    key(did: string) {
        return `profile-detailed:${did}`
    }

    formatCached(p: string | null): ArCabildoabiertoActorDefs.ProfileViewDetailed | null {
        if(p == null) return null
        const profile: ArCabildoabiertoActorDefs.ProfileViewDetailed = JSON.parse(p)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {viewer, ...profileNoViewer} = profile

        // sacamos al viewer porque depende del agent
        return profileNoViewer
    }

    async get(did: string): Promise<ArCabildoabiertoActorDefs.ProfileViewDetailed | null> {
        const cached = await this.cache.redis.get(this.key(did))
        if(!cached) return null
        return this.formatCached(cached)
    }

    getMany(dids: string[]): Effect.Effect<(ArCabildoabiertoActorDefs.ProfileViewDetailed | null)[], RedisCacheFetchError> {
        // Cache desactivada
        return Effect.succeed(dids.map(d => null))

        /*if(dids.length == 0) return []
        const cached = await this.cache.redis.mget(dids.map(d => this.key(d)))
        const profiles: (ArCabildoabiertoActorDefs.ProfileViewDetailed | null)[] = cached.map(this.formatCached)
        return profiles*/
    }

    async set(did: string, profile: ArCabildoabiertoActorDefs.ProfileViewDetailed) {
        await this.cache.redis.set(
            this.key(did),
            JSON.stringify(profile)
        )
    }

    setMany(profiles: ArCabildoabiertoActorDefs.ProfileViewDetailed[]): Effect.Effect<void, RedisCacheSetError> {
        return Effect.tryPromise({
            try: () => this.cache.setMany(
                profiles.map(p => [this.key(p.did), JSON.stringify(p)])
            ),
            catch: () => new RedisCacheSetError()
        })
    }

    async onEvent(e: RedisEvent, params: string[]) {
        if(e == "verification-update" && params.length == 1) {
            const [did] = params
            await this.del(did)
        }
    }

    async clear() {
        await this.cache.deleteByPrefix("profile-detailed")
    }
}


export class FollowingFeedSkeletonKey extends CacheKey {
    params: string[]

    constructor(cache: RedisCache, params: string[]) {
        super(cache)
        this.params = params
    }

    key(did: string) {
        return this.buildKey(["following-feed-skeleton", did, ...this.params])
    }

    async clear() {
        await this.cache.deleteByPrefix("following-feed-skeleton")
    }

    async get(did: string, score: number | null, limit: number): Promise<string[]> {
        const max = score != null ? score-1 : "+inf"
        return this.cache.redis
            .zrevrangebyscore(
                this.key(did),
                max,
                '-inf',
                'WITHSCORES',
                'LIMIT',
                0,
                limit
            )
    }

    async add(did: string, elements: ({score: number} & FollowingFeedSkeletonElement)[]) {
        await this.cache.redis.zadd(this.key(did),
            ...elements.flatMap(({score, ...r}) => {
                return [score, JSON.stringify(r)]
            })
        )
    }
}


class CAFollowsCacheKey extends CacheKey {
    async onUpdateRecords(r: RefAndRecord<any>[]) {
        await this.onUpdateOrDeleteRecords(r.map(r => r.ref.uri))
    }

    async onDeleteRecords(uris: string[]) {
        await this.onUpdateOrDeleteRecords(uris)
    }

    async onUpdateOrDeleteRecords(uris: string[]) {
        uris = uris.filter(u => isFollow(getCollectionFromUri(u)))
        if(uris.length == 0) return
        const dids = unique(uris.map(getDidFromUri))
        for(let i = 0; i < dids.length; i++){
            await this.cache.redis.del(`ca-follows:${dids[i]}`)
        }
    }

    key(did: string){
        return `ca-follows:${did}`
    }

    async clear() {
        await this.cache.deleteByPrefix("ca-follows")
    }

    async get(did: string): Promise<string[] | null> {
        const cached = await this.cache.redis.get(this.key(did));
        if (cached) {
            return JSON.parse(cached);
        }
        return null
    }

    async set(did: string, follows: string[]) {
        await this.cache.redis.set(
            this.key(did),
            JSON.stringify(follows),
            "EX",
            60 * 5
        ) // 5 min TTL
    }
}


class FollowSuggestionsDirtyCacheKey extends CacheKey {
    async onUpdateRecords(records: RefAndRecord<any>[]) {
        await this.onUpdateOrDeleteRecords(records.map(r => r.ref.uri))
    }

    async onDeleteRecords(uris: string[]) {
        await this.onUpdateOrDeleteRecords(uris)
    }

    async onUpdateOrDeleteRecords(uris: string[]) {
        uris = uris.filter(u => isFollow(getCollectionFromUri(u)))
        if(uris.length == 0) return
        const dids = unique(uris.map(getDidFromUri))
        for(let i = 0; i < dids.length; i++){
            await this.setFollowSuggestionsDirty(dids[i])
        }
    }

    async setFollowSuggestionsDirty(did: string) {
        await this.cache.redis.sadd("follow-suggestions-dirty", did)
    }

    async setFollowSuggestionsReady(did: string) {
        await this.cache.redis.srem("follow-suggestions-dirty", did)
    }

    async clear() {
        // TO DO no se limpia. Probablemente esto no debería estar en Redis.
    }

    async onEvent(e: RedisEvent, params: string[]) {
        if(params.length == 1){
            const did = params[0]
            if(e == "follow-suggestions-ready"){
                await this.setFollowSuggestionsReady(did)
            } else if(e == "follow-suggestions-dirty"){
                await this.setFollowSuggestionsDirty(did)
            }
        }
    }

    async getDirty() {
        const dirty = await this.cache.redis.smembers("follow-suggestions-dirty")
        const keys: string[] = await this.cache.getKeysByPrefix(`follow-suggestions:`)
        const requested = new Set(keys.map(k => k.replace("follow-suggestions:", "")))

        return dirty.filter((did: string) => requested.has(did))
    }
}


class FollowSuggestionsCacheKey extends CacheKey {
    async get(did: string): Promise<string[] | null> {
        const res = await this.cache.redis.get(this.key(did))
        return res ? JSON.parse(res) : null
    }

    key(did: string) {
        return `follow-suggestions:${did}`
    }

    async clear() {
        // TO DO no se limpia. Probablemente esto no debería estar en Redis.
    }

    async set(did: string, dids: string[]) {
        await this.cache.redis.set(
            this.key(did),
            JSON.stringify(dids)
        )
    }
}


export type MirrorStatus = "Sync" | "Dirty" | "InProcess" | "Failed" | "Failed - Too Large"

class MirrorStatusCacheKey extends CacheKey {
    mirrorId: string

    constructor(cache: RedisCache, mirrorId: string){
        super(cache)
        this.mirrorId = mirrorId
    }

    async clear() {
        await this.cache.deleteByPrefix(`${this.mirrorId}:mirror-status`)
    }

    key(did: string, inCA: boolean) {
        return `${this.mirrorId}:mirror-status:${did}:${inCA ? "ca" : "ext"}`
    }

    set(did: string, mirrorStatus: MirrorStatus, inCA: boolean): Effect.Effect<void, RedisCacheSetError> {
        return Effect.tryPromise({
            try: () => this.cache.redis.set(
                this.key(did, inCA),
                mirrorStatus
            ),
            catch: () => new RedisCacheSetError()
        })
    }

    get(did: string, inCA: boolean): Effect.Effect<MirrorStatus, RedisCacheFetchError> {
        return Effect.tryPromise({
            try: () => this.cache.redis.get(this.key( did, inCA)),
            catch: () => new RedisCacheFetchError()
        }).pipe(
            Effect.map(res => res ? (res as MirrorStatus) : "Dirty")
        )
    }
}


class DidsAndHandlesCacheKey extends CacheKey {

    async getHandle(did: string): Promise<string | null> {
        return this.cache.redis.get(`did->handle:${did}`);
    }

    async getDid(handle: string): Promise<string | null> {
        return this.cache.redis.get(`handle->did:${handle}`);
    }

    async setHandle(did: string, handle: string) {
        await this.cache.redis.set(`did->handle:${did}`, handle, 'EX', 3600)
        await this.cache.redis.set(`handle->did:${did}`, handle, 'EX', 3600)
    }
}


class SingleKey<T> extends CacheKey {
    key: string
    ttl: number | undefined
    constructor(cache: RedisCache, key: string, ttl?: number) {
        super(cache)
        this.key = key
        this.ttl = ttl
    }

    async get(): Promise<T | null> {
        const res = await this.cache.redis.get(this.key)
        return res ? JSON.parse(res) : null
    }

    async set(v: T) {
        if(this.ttl){
            await this.cache.redis.set(this.key, JSON.stringify(v), "EX", this.ttl)
        } else {
            await this.cache.redis.set(this.key, JSON.stringify(v))
        }
    }
}

export type RedisEvent = "verification-update" | "follow-suggestions-ready" | "follow-suggestions-dirty"

export class RedisCache {
    redis: Redis
    keys: CacheKey[] = []
    logger: Logger
    followSuggestionsDirty: FollowSuggestionsDirtyCacheKey
    followSuggestions: FollowSuggestionsCacheKey
    CAFollows: CAFollowsCacheKey
    mirrorStatus: MirrorStatusCacheKey
    followingFeedSkeletonCAAll: FollowingFeedSkeletonKey
    followingFeedSkeletonCAArticles: FollowingFeedSkeletonKey
    profile: ProfileCacheKey
    nextMeeting: SingleKey<NextMeeting>
    resolver: DidsAndHandlesCacheKey

    constructor(redis: Redis, mirrorId: string, logger: Logger) {
        this.redis = redis
        this.followSuggestions = new FollowSuggestionsCacheKey(this)
        this.followSuggestionsDirty = new FollowSuggestionsDirtyCacheKey(this)
        this.mirrorStatus = new MirrorStatusCacheKey(this, mirrorId)
        this.CAFollows = new CAFollowsCacheKey(this)
        this.followingFeedSkeletonCAAll = new FollowingFeedSkeletonKey(this, ["ca-all"])
        this.followingFeedSkeletonCAArticles = new FollowingFeedSkeletonKey(this, ["ca-articles"])
        this.profile = new ProfileCacheKey(this)
        this.resolver = new DidsAndHandlesCacheKey(this)
        this.nextMeeting = new SingleKey<NextMeeting>(this, "next-meeting", 60*60)
        this.logger = logger

        this.keys = [
            this.profile,
            this.followSuggestions,
            this.CAFollows,
            this.followSuggestionsDirty,
            this.followingFeedSkeletonCAAll,
            this.followingFeedSkeletonCAArticles,
            this.resolver
        ]
    }

    async onUpdateRecords(records: RefAndRecord<any>[]) {
        for(const k of this.keys) {
            await k.onUpdateRecords(records)
        }
    }

    async onDeleteRecords(uris: string[]) {
        for(const k of this.keys) {
            await k.onDeleteRecords(uris)
        }
    }

    async onEvent(e: RedisEvent, params: string[]) {
        for(const k of this.keys) {
            await k.onEvent(e, params)
        }
    }

    async deleteByPrefix(prefix: string) {
        const stream = this.redis.scanStream({
            match: `${prefix}*`,
            count: 100
        })

        stream.on("data", async (keys) => {
            if (keys.length) {
                const pipeline = this.redis.pipeline()
                keys.forEach((key: string) => pipeline.del(key))
                await pipeline.exec();
            }
        })
    }

    async getKeysByPrefix(prefix: string) {
        return this.redis.keys(`${prefix}*`)
    }

    async setMany(items: [string, string][], ttl?: number) {
        const pipeline = this.redis.pipeline()

        items.forEach(([key, value]) => {
            // Queue the SET command
            pipeline.set(key, value);
            // Queue the EXPIRE command
            if(ttl) pipeline.expire(key, ttl)
        })

        await pipeline.exec()
    }

    async clear() {
        const toClear = [
            this.profile,
            this.CAFollows,
            this.followingFeedSkeletonCAAll,
            this.followingFeedSkeletonCAArticles,
        ]

        for (const k of toClear) {
            await k.clear()
        }
    }
}

export const clearRedisHandler: CAHandler<{ params: { prefix: string } }, {}> = async (ctx, agent, {params}) => {
    console.log("Clearing redis prefix", params.prefix)
    await ctx.redisCache.deleteByPrefix(params.prefix)
    return {data: {}}
}


export async function clearAllRedis(ctx: AppContext) {
    await ctx.redisCache.clear()

    await ctx.worker?.clearFailedAndCompleted()
}
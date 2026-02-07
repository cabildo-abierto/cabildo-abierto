import WebSocket, {RawData} from 'ws';
import {getCAUsersDids} from "#/services/user/users.js";
import {AppContext} from "#/setup.js";
import {getUri, isCAProfile, isFollow} from "@cabildo-abierto/utils";
import {addPendingEvent, getCAUsersAndFollows} from "#/services/sync/sync-user.js";
import {CommitEvent, JetstreamEvent} from "#/lib/types.js";
import {AppBskyGraphFollow} from "@atproto/api"
import {processEventsBatch} from "#/services/sync/event-processing/event-processor.js";
import {LRUCache} from 'lru-cache'
import {env} from "#/lib/env.js";
import {updateTimestamp} from "#/services/admin/status.js";
import {Effect} from "effect";

function formatEventsPerSecond(events: number, elapsed: number) {
    return (events / (elapsed / 1000)).toFixed(2)
}

export function getUriFromCommitEvent(commitEvent: CommitEvent) {
    return getUri(commitEvent.did, commitEvent.commit.collection, commitEvent.commit.rkey)
}

export class MirrorMachine {
    caUsers: Set<string> = new Set()
    extendedUsers: Set<string> = new Set()
    tooLargeUsers: Set<string> = new Set()
    eventCounter: number = 0
    relevantEventCounter: number = 0
    lastLog: Date = new Date()
    lastRetry: Map<string, Date> = new Map()
    seen: LRUCache<string, true> = new LRUCache({max: 100000})

    ctx: AppContext

    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    async setup() {
        this.ctx.logger.pino.info("setting up mirror")
        await this.fetchUsers()
        await this.ctx.redisCache.mirrorStatus.clear()

        this.ctx.logger.pino.info({
            ca: this.caUsers.size,
            extended: this.extendedUsers.size
        }, "mirrored users size")
    }

    useExtended() {
        return env.MIRROR_EXTENDED_USERS
    }

    async fetchUsers() {
        const dids = await Effect.runPromise(getCAUsersDids(this.ctx))
        let extendedUsers: string[] = []
        if (this.useExtended()) {
            extendedUsers = (await getCAUsersAndFollows(this.ctx)).map(x => x.did)
        }
        this.caUsers = new Set(dids)
        this.extendedUsers = new Set(extendedUsers.filter(x => !this.caUsers.has(x)))
        this.tooLargeUsers = new Set()
    }

    async logEventsPerSecond() {
        const date = new Date()
        const elapsed = date.getTime() - this.lastLog.getTime()
        if (elapsed > 20 * 1000) {
            this.ctx.logger.pino.info({
                now: date,
                all: formatEventsPerSecond(this.eventCounter, elapsed),
                relevant: formatEventsPerSecond(this.relevantEventCounter, elapsed)
            }, "events per second")

            const hadEvents = this.relevantEventCounter > 0
            this.eventCounter = 0
            this.relevantEventCounter = 0
            this.lastLog = date

            if (hadEvents) {
                this.ctx.logger.pino.info("updating last mirror event timestamp")
                await updateTimestamp(this.ctx, `last-mirror-event-${this.ctx.mirrorId}`, date)
            }
        }
    }

    connectToJetstream = (domain: string) => {
        const url = `wss://${domain}/subscribe?wantedCollections=app.bsky.*&wantedCollections=ar.cabildoabierto.*`
        const ws = new WebSocket(url)

        ws.on('open', () => {
            this.ctx.logger.pino.info({domain}, `connected to ws`);
        })

        ws.on('error', (error: Error) => {
            this.ctx.logger.pino.error({error, domain}, 'ws error')
            ws.close()
        })

        ws.on('close', () => {
            this.ctx.logger.pino.warn({domain}, 'ws closed, retrying')
            setTimeout(() => this.connectToJetstream(domain), 5000)
        })

        ws.on('message', async (data: RawData) => {
            await this.handleMessage(data)
        })
    }

    seenKey(e: JetstreamEvent) {
        if (e.kind == "commit") {
            return `${e.kind}:${e.did}:${e.commit.collection}:${e.commit.rkey}:${e.commit.cid}:${e.commit.rev}`
        } else if (e.kind == "identity") {
            return `${e.kind}:${e.did}:${e.identity.seq}`
        } else if (e.kind == "account") {
            return `${e.kind}:${e.did}:${e.time_us}`
        } else if (e.kind == "update") {
            return `${e.kind}:${e.did}:${e.time_us}`
        } else {
            throw Error(`Unknown Jetstream event kind`)
        }
    }

    markSeen(e: JetstreamEvent) {
        this.seen.set(this.seenKey(e), true)
    }

    async handleMessage(data: RawData) {
        const e: JetstreamEvent = JSON.parse(data.toString())

        await this.logEventsPerSecond()
        this.eventCounter++

        if (e.kind == "commit" && isCAProfile(e.commit.collection) && e.commit.rkey == "self") {
            this.caUsers.add(e.did)
            this.extendedUsers.add(e.did)
            this.ctx.logger.pino.info({did: e.did}, "user added to ca")
        }

        const inCA = this.caUsers.has(e.did)
        const inExtended = this.extendedUsers.has(e.did)
        const inTooLarge = this.tooLargeUsers.has(e.did)

        if ((!inCA && !inExtended) || inTooLarge) {
            if (inTooLarge) {
                this.ctx.logger.pino.info({did: e.did, reason: "repo too large"}, "event ignored")
            }
            return
        }

        if (this.seen.has(this.seenKey(e))) {
            return
        }
        this.markSeen(e)

        if (inCA) {
            await this.processEvent(this.ctx, e, inCA)
            if (e.kind == "commit" && isFollow(e.commit.collection) && e.commit.operation != "delete") {
                const record: AppBskyGraphFollow.Record = e.commit.record
                this.extendedUsers.add(record.subject)
                this.ctx.logger.pino.info({did: record.subject}, "added extended user to mirror")
            }
        } else if (inExtended && e.kind == "commit" && isFollow(e.commit.collection)) {
            await this.processEvent(this.ctx, e, inCA)
        }
    }

    async run() {
        await this.setup()

        this.connectToJetstream("jetstream1.us-east.bsky.network")
        this.connectToJetstream("jetstream2.us-east.bsky.network")
        this.connectToJetstream("jetstream1.us-west.bsky.network")
        this.connectToJetstream("jetstream2.us-west.bsky.network")

        if (process.send) {
            process.send("ready")
            this.ctx.logger.pino.info("mirror is ready")
        }
    }

    async processEvent(ctx: AppContext, e: JetstreamEvent, inCA: boolean) {
        const mirrorStatus = await Effect.runPromise(ctx.redisCache.mirrorStatus.get(e.did, inCA))

        if (e.kind == "commit") {
            const uri = getUriFromCommitEvent(e)
            ctx.logger.pino.info({uri, mirrorStatus}, `sync event`)
        } else {
            ctx.logger.pino.info({did: e.did, mirrorStatus}, `sync event`)
        }

        if (mirrorStatus == "Sync") {
            const t1 = Date.now()
            try {
                await processEventsBatch(ctx, [e])
            } catch (error) {
                ctx.logger.pino.error({event: e, error}, "error processing event")
                await Effect.runPromise(ctx.redisCache.mirrorStatus.set(e.did, "Dirty", inCA))
            }
            const t2 = Date.now()
            ctx.logger.pino.info({
                time: t2 - t1,
                id: e.kind == "commit" ? getUriFromCommitEvent(e) : this.seenKey(e)},
                `event processed`
            )
        } else if (mirrorStatus == "Dirty") {
            await Effect.runPromise(ctx.redisCache.mirrorStatus.set(e.did, "InProcess", inCA))
            await Effect.runPromise(ctx.worker?.addJob("sync-user", {
                    handleOrDid: e.did,
                    collectionsMustUpdate: inCA ? undefined : ["app.bsky.graph.follow"]
                },
                inCA ? 5 : 15
            ))
        } else if (mirrorStatus == "InProcess") {
            await addPendingEvent(ctx, e.did, e)

        } else if (mirrorStatus == "Failed") {
            const last = this.lastRetry.get(e.did)
            if (!last || last.getTime() - Date.now() > 6 * 3600 * 1000) {
                this.lastRetry.set(e.did, new Date())
                await Effect.runPromise(ctx.redisCache.mirrorStatus.set(e.did, "InProcess", inCA))
                await Effect.runPromise(ctx.worker?.addJob("sync-user", {handleOrDid: e.did}))
            }
        } else if (mirrorStatus == "Failed - Too Large") {
            this.tooLargeUsers.add(e.did)
        }
        this.relevantEventCounter++
    }
}
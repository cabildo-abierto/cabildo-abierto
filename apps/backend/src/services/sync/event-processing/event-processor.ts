import {AppContext} from "#/setup.js";
import {JetstreamEvent} from "#/lib/types.js";
import {getUri, isCAProfile} from "@cabildo-abierto/utils";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {getDeleteProcessor} from "#/services/sync/event-processing/get-delete-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {isValidHandle} from "@atproto/syntax";


function newUser(ctx: AppContext, did: string, inCA: boolean) {
    if (inCA) {
        return ctx.kysely.insertInto("User")
            .values([{
                did,
                inCA: true
            }])
            .onConflict(oc => oc.column("did").doUpdateSet(eb => ({
                inCA: eb => eb.ref("excluded.inCA")
            })))
            .execute()
    } else {
        return ctx.kysely.insertInto("User")
            .values([{
                did
            }])
            .onConflict(oc => oc.column("did").doNothing())
            .execute()
    }
}

export class EventProcessor {
    ctx: AppContext

    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    async process(e: JetstreamEvent[]) {

    }
}


class CommitEventProcessor extends EventProcessor {

    constructor(ctx: AppContext){
        super(ctx)

    }

    async process(events: JetstreamEvent[]) {
        await super.process(events)

        for(const c of events) {
            if(c.kind == "commit") {
                if (isCAProfile(c.commit.collection) && c.commit.rkey == "self") {
                    await newUser(this.ctx, c.did, true)
                }
            }
        }
    }
}


class CommitCreateOrUpdateEventProcessor extends CommitEventProcessor {
    async process(events: JetstreamEvent[]) {
        await super.process(events)

        const byCollection = new Map<string, RefAndRecord[]>()
        for(const c of events) {
            if(c.kind == "commit" && c.commit.operation != "delete"){
                const collection = c.commit.collection
                const uri = getUri(c.did, c.commit.collection, c.commit.rkey)
                const ref = {uri, cid: c.commit.cid}
                const refAndRecord = {ref, record: c.commit.record}

                const cur = byCollection.get(collection)
                if(!cur) {
                    byCollection.set(collection, [refAndRecord])
                } else {
                    cur.push(refAndRecord)
                }
            }
        }

        for await (const [c, refAndRecords] of byCollection.entries()) {
            const recordProcessor = getRecordProcessor(this.ctx, c)
            await recordProcessor.process(refAndRecords)
        }
    }
}


class CommitDeleteEventProcessor extends CommitEventProcessor {
    async process(events: JetstreamEvent[]) {
        await super.process(events)

        const byCollection = new Map<string, string[]>()
        for(const c of events) {
            if(c.kind == "commit" && c.commit.operation == "delete"){
                const collection = c.commit.collection
                const uri = getUri(c.did, c.commit.collection, c.commit.rkey)

                const cur = byCollection.get(collection)
                if(!cur) {
                    byCollection.set(collection, [uri])
                } else {
                    cur.push(uri)
                }
            }
        }

        for await (const [c, uris] of byCollection.entries()) {
            const recordProcessor = getDeleteProcessor(this.ctx, c)
            await recordProcessor.process(uris)
        }
    }
}


class IdentityEventProcessor extends EventProcessor {
    async process(events: JetstreamEvent[]) {
        for(const e of events) {
            if(e.kind == "identity") {
                if(isValidHandle(e.identity.handle)){
                    await this.updateUserIdentity(e.identity.did, e.identity.handle)
                }
            }
        }
    }

    async updateUserIdentity(did: string, handle: string) {
        this.ctx.logger.pino.info({did, handle}, "updating user identity")
        await this.ctx.kysely
            .updateTable("User")
            .set("handle", handle)
            .where("User.did", "=", did)
            .execute()
        await this.ctx.redisCache.resolver.setHandle(did, handle)
    }
}


export async function processEventsBatch(ctx: AppContext, events: JetstreamEvent[]) {
    await new CommitCreateOrUpdateEventProcessor(ctx).process(events)
    await new CommitDeleteEventProcessor(ctx).process(events)
    await new IdentityEventProcessor(ctx).process(events)
}


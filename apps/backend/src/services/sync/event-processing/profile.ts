import {getDidFromUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoActorCaProfile} from "@cabildo-abierto/api"
import {AppBskyActorProfile} from "@atproto/api"
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {getCidFromBlobRef} from "#/services/sync/utils.js";
import {InsertRecordError, RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";
import {ValidationResult} from "@atproto/lexicon";
import {AppContext} from "#/setup.js";
import {Effect} from "effect";


export class CAProfileRecordProcessor extends RecordProcessor<ArCabildoabiertoActorCaProfile.Record> {
    validateRecord(record: ArCabildoabiertoActorCaProfile.Record) {
        return Effect.succeed(ArCabildoabiertoActorCaProfile.validateRecord(record))
    }

    addRecordsToDB(records: RefAndRecord<ArCabildoabiertoActorCaProfile.Record>[], reprocess: boolean = false) {
        return processCAProfilesBatch(this.ctx, records)
    }
}


export class CAProfileDeleteProcessor extends DeleteProcessor {

    async deleteRecordsFromDB(uris: string[]){
        const dids = uris.map(getDidFromUri)

        try {
            await this.ctx.kysely.transaction().execute(async (trx) => {
                await trx
                    .deleteFrom("Record")
                    .where("Record.uri", "in", uris)
                    .execute()

                await trx
                    .updateTable("User")
                    .set("inCA", false)
                    .set("hasAccess", false)
                    .where("User.did", "in", dids)
                    .execute()
            })
        } catch (error) {
            this.ctx.logger.pino.error({error, uris}, "error deleting ca profiles")
        }
    }
}


export class OldCAProfileRecordProcessor extends RecordProcessor<any> {

    validateRecord= (r: any): Effect.Effect<ValidationResult<any>, never> => {
        return Effect.succeed({
            success: true,
            value: r
        })
    }

    addRecordsToDB(records: {ref: ATProtoStrongRef, record: any}[], reprocess: boolean = false) {
        return processCAProfilesBatch(this.ctx, records)
    }
}

function processCAProfilesBatch(ctx: AppContext, records: RefAndRecord[]): Effect.Effect<number, InsertRecordError> {
    const values = records.map(r => {
        return {
            did: getDidFromUri(r.ref.uri),
            CAProfileUri: r.ref.uri,
            inCA: true,
            created_at_tz: r.record.created_at
        }
    })

    const insertRecords = ctx.kysely.transaction().execute(async (trx) => {
        await new RecordProcessor(ctx).processRecordsBatch(trx, records)

        await trx
            .insertInto("User")
            .values(values)
            .onConflict(oc => oc.column("did").doUpdateSet(() => ({
                CAProfileUri: eb => eb.ref("excluded.CAProfileUri"),
                inCA: eb => eb.ref("excluded.inCA"),
                created_at_tz: eb => eb.ref("excluded.created_at_tz")
            })))
            .execute()

        return values.length
    })

    return Effect.tryPromise({
        try: () => insertRecords,
        catch: () => new InsertRecordError()
    })
}


export class BskyProfileRecordProcessor extends RecordProcessor<AppBskyActorProfile.Record> {

    validateRecord(record: AppBskyActorProfile.Record) {
        return Effect.succeed(AppBskyActorProfile.validateRecord(record))
    }

    addRecordsToDB(records: RefAndRecord<AppBskyActorProfile.Record>[], reprocess: boolean = false) {
        const ctx = this.ctx
        return Effect.gen(function*() {
            const values: {
                did: string
                description?: string
                displayName?: string
                avatar?: string
                banner?: string
                handle?: string
                created_at_tz?: Date
            }[] = yield* Effect.all(records.map(({ref, record: r}) => {
                const did = getDidFromUri(ref.uri)
                const avatarCid = r.avatar ? getCidFromBlobRef(r.avatar) : undefined
                const avatar = avatarCid ? avatarUrl(did, avatarCid) : undefined
                const bannerCid = r.banner ? getCidFromBlobRef(r.banner) : undefined
                const banner = bannerCid ? bannerUrl(did, bannerCid) : undefined

                return Effect.gen(function* () {
                    const handle = yield* ctx.resolver.resolveDidToHandle(did, true)

                    return {
                        did: did,
                        description: r.description != null ? r.description : undefined,
                        displayName: r.displayName != null ? r.displayName : undefined,
                        avatar,
                        banner,
                        handle,
                        created_at_tz: r.createdAt ? new Date(r.createdAt) : undefined
                    }
                })
            }))

            yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .insertInto("User")
                    .values(values)
                    .onConflict(oc => oc.column("did").doUpdateSet(() => ({
                        handle: eb => eb.ref("excluded.handle"),
                        avatar: eb => eb.ref("excluded.avatar"),
                        banner: eb => eb.ref("excluded.banner"),
                        displayName: eb => eb.ref("excluded.displayName"),
                        created_at_tz: eb => eb.ref("excluded.created_at_tz"),
                        description: eb => eb.ref("excluded.description")
                    })))
                    .execute(),
                catch: () => new InsertRecordError()
            })

            return values.length
        }).pipe(Effect.catchTag("HandleResolutionError", () => Effect.fail(new InsertRecordError())))
    }
}


function avatarUrl(did: string, cid: string) {
    return "https://cdn.bsky.app/img/avatar/plain/" + did + "/" + cid + "@jpeg"
}

function bannerUrl(did: string, cid: string) {
    return "https://cdn.bsky.app/img/banner/plain/" + did + "/" + cid + "@jpeg"
}
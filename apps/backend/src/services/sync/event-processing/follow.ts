import {AppBskyGraphFollow} from "@atproto/api"
import {RecordProcessor} from "#/services/sync/event-processing/record-processor.js";
import {DeleteProcessor} from "#/services/sync/event-processing/delete-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";



export class FollowRecordProcessor extends RecordProcessor<AppBskyGraphFollow.Record> {
    validateRecord = AppBskyGraphFollow.validateRecord

    async addRecordsToDB(records: RefAndRecord<AppBskyGraphFollow.Record>[], reprocess: boolean = false) {
        await this.ctx.kysely.transaction().execute(async (trx) => {
            await this.processRecordsBatch(trx, records)
            await this.createUsersBatch(trx, records.map(r => r.record.subject))

            const follows = records.map(r => ({
                uri: r.ref.uri,
                userFollowedId: r.record.subject
            }))

            await trx
                .insertInto("Follow")
                .values(follows)
                .onConflict((oc) =>
                    oc.column("uri").doUpdateSet({
                        userFollowedId: (eb) => eb.ref('excluded.userFollowedId'),
                    })
                )
                .execute()
        })
    }
}


export class FollowDeleteProcessor extends DeleteProcessor {
    async deleteRecordsFromDB(uris: string[]){
        await this.ctx.kysely.transaction().execute(async (trx) => {
            await trx
                .deleteFrom("Follow")
                .where("Follow.uri", "in", uris)
                .execute()

            await trx
                .deleteFrom("Record")
                .where("Record.uri", "in", uris)
                .execute()
        })
    }
}
import {AppContext} from "#/setup.js";
import {getRecordProcessor} from "#/services/sync/event-processing/get-record-processor.js";
import {RefAndRecord} from "#/services/sync/types.js";


async function countCollectionRecords(ctx: AppContext, collection: string): Promise<number> {
    const res = await ctx.kysely
        .selectFrom('Record')
        .select((eb) => eb.fn.countAll<number>().as('count')) // Use countAll() for COUNT(*)
        .where('collection', '=', collection)
        .where("record", "is not", null)
        .where("cid", "is not", null)
        .executeTakeFirstOrThrow()
    return res.count
}


export async function reprocessCollection(ctx: AppContext, collection: string, onlyRecords: boolean = true): Promise<void> {
    let offset = 0
    const bs = 5000

    const count = await countCollectionRecords(ctx, collection)

    ctx.logger.pino.info({collection, count, onlyRecords}, "Reprocessing collection...")

    const processor = getRecordProcessor(ctx, collection)

    while(true) {
        const t1 = Date.now()
        const records = await ctx.kysely
            .selectFrom("Record")
            .select(["Record.uri", "Record.cid", "Record.record"])
            .where("collection", "=", collection)
            .where("Record.record", "is not", null)
            .where("Record.cid", "is not", null)
            .limit(bs)
            .offset(offset)
            .orderBy("created_at asc")
            .execute()
        const t2 = Date.now()

        if(records.length == 0) break

        const refAndRecords: RefAndRecord[] = records.map(r => {
            if(r.record && r.cid) {
                return {
                    ref: {
                        uri: r.uri,
                        cid: r.cid
                    },
                    record: JSON.parse(r.record)
                }
            }
            return null
        }).filter(x => x != null)

        if(onlyRecords) {
            await ctx.kysely.transaction().execute(async trx => {
                await processor.processRecordsBatch(trx, refAndRecords)
            })
        } else {
            await processor.process(refAndRecords, true)
        }
        const t3 = Date.now()

        ctx.logger.logTimes( "Reprocessed collection batch", [t1, t2, t3], {offset, count: records.length, collection})
        if(records.length < bs) break
        offset += bs
    }
}
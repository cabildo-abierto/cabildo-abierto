import {ATProtoStrongRef} from "#/lib/types.js";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";
import {
    SyncContentProps
} from "#/services/sync/types.js";
import {AppContext} from "#/setup.js";


export const processContentsBatch = async (ctx: AppContext, trx: Transaction<DB>, records: {
    ref: ATProtoStrongRef,
    record: SyncContentProps
}[]) => {
    if (records.length == 0) return

    const blobData = records.map(c => {
        return c.record.textBlob ?? null
    }).filter(b => b != null)

    if (blobData.length > 0) {
        await trx
            .insertInto("Blob")
            .values(blobData)
            .onConflict((oc) => oc.column("cid").doNothing())
            .execute()
    }

    const contentDatasetLinks = records.flatMap(c =>
        (c.record.datasetsUsed ?? []).map(datasetUri => ({
            A: c.ref.uri,
            B: datasetUri
        }))
    )

    const contentData = records.map(c => {
        const r = c.record
        return {
            text: r.text,
            textBlobId: r.textBlob?.cid,
            uri: c.ref.uri,
            format: r.format,
            selfLabels: r.selfLabels ?? [],
            embeds: c.record.embeds ?? [],
        }
    })
    if (contentData.length > 0) {
        await trx
            .insertInto("Content")
            .values(contentData)
            .onConflict(oc =>
                oc.column("uri").doUpdateSet({
                    text: (eb) => eb.ref('excluded.text'),
                    textBlobId: (eb) => eb.ref('excluded.textBlobId'),
                    format: (eb) => eb.ref('excluded.format'),
                    selfLabels: (eb) => eb.ref('excluded.selfLabels'),
                })
            )
            .execute()
    }

    if (contentDatasetLinks.length > 0) {
        // TO DO: Borrar datasets que se dejaron de usar
        await trx
            .insertInto('_ContentToDataset')
            .values(contentDatasetLinks)
            .onConflict(oc => oc.columns(['A', 'B']).doNothing())
            .execute()
    }
}
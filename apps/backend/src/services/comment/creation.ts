import {DB} from "../../../prisma/generated/types.js";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {getCollectionFromUri} from "@cabildo-abierto/utils";
import {processDirtyRecordsBatch} from "#/services/record/creation.js";

export async function processDirtyPostsBatch(trx: Transaction<DB>, refs: ATProtoStrongRef[]) {
    refs = refs.filter(
        r => getCollectionFromUri(r.uri) == "app.bsky.feed.post"
    )
    if(refs.length == 0) return
    await processDirtyRecordsBatch(trx, refs)
    await trx
        .insertInto("Content")
        .values(refs.map(r => {
            return {
                uri: r.uri,
                collection: getCollectionFromUri(r.uri),
                selfLabels: [],
                embeds: []
            }
        }))
        .onConflict(oc => oc.column("uri").doNothing())
        .execute()
    await trx
        .insertInto("Post")
        .values(refs.map(r => {
            return {
                uri: r.uri,
                langs: []
            }
        }))
        .onConflict(oc => oc.column("uri").doNothing())
        .execute()
}
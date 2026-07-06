import {Transaction} from "kysely";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri} from "@cabildo-abierto/utils";
import { createUsersBatch } from "../user/creation.js";
import {DB} from "../../../prisma/generated/types.js";
import {DBInsertError} from "#/utils/errors.js";
import {Effect} from "effect";


export const processDirtyRecordsBatch = (
    trx: Transaction<DB>,
    refs: {uri: string, cid?: string}[]
) => Effect.gen(function* () {
    if (refs.length == 0) return

    const users = refs.map(r => getDidFromUri(r.uri))
    yield* createUsersBatch(trx, users)

    const data = refs.map(({uri, cid}) => ({
        uri,
        rkey: getRkeyFromUri(uri),
        collection: getCollectionFromUri(uri),
        authorId: getDidFromUri(uri),
        cid,
        record: null,
        indexedAt: new Date()
    }))

    if (data.length == 0) return

    yield* Effect.tryPromise({
        try: () => trx
            .insertInto("Record")
            .values(data)
            .onConflict((oc) => oc.column("uri").doNothing())
            .execute(),
        catch: e => new DBInsertError(e)
    })
})




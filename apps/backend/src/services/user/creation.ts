import {AppContext} from "#/setup.js";
import {unique} from "@cabildo-abierto/utils";
import {DB} from "../../../prisma/generated/types.js";
import {Kysely, Transaction} from "kysely";
import {Effect} from "effect";
import {DBInsertError} from "#/utils/errors.js";


export function newUser(ctx: AppContext, did: string, inCA: boolean) {
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
        return createUsersBatch(ctx.kysely, [did])
    }
}


export const createUsersBatch = (
    trx: Transaction<DB> | Kysely<DB>,
    dids: string[]
) => Effect.gen(function* () {
    if (dids.length == 0) return
    dids = unique(dids)
    yield* Effect.tryPromise({
        try: () => trx
            .insertInto("User")
            .values(dids.map(did => ({did})))
            .onConflict((oc) => oc.column("did").doNothing())
            .execute(),
        catch: e => new DBInsertError(e)
    })
})
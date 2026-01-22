import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from "uuid";
import {notifyContentCreated} from "#/services/moderation/notifications.js";
import {getDidFromUri} from "@cabildo-abierto/utils";


function automaticModeration(uri: string) {
    const author = getDidFromUri(uri)
    if(["did:plc:2semihha42b7efhu4ywv7whi", "did:plc:arplmoycj2z7jz3wljgyq3lh", "did:plc:2356xofv4ntrbu42xeilxjnb"].includes(author)) {
        return {
            result: "ok"
        }
    } else {
        return {
            result: "review-required"
        }
    }
}


export async function startContentModeration(ctx: AppContext, contents: {uri: string, context: string}[]) {
    const values = contents.map(c => {
        return {
            id: uuidv4(),
            recordId: c.uri
        }
    })

    await ctx.kysely
        .insertInto("RecordModerationProcess")
        .values(values)
        .onConflict(oc => oc.column("recordId").doNothing())
        .execute()

    const approved: {
        uri: string
        id: string
    }[] = []
    for(let i = 0; i < contents.length; i++){
        const c = contents[i]
        const {result} = automaticModeration(c.uri)
        if(result == "review-required") {
            await notifyContentCreated(ctx, c.uri, c.context)
        } else if(result == "ok") {
            approved.push({
                uri: c.uri,
                id: values[i].id
            })
        }
    }

    if(approved.length > 0) {
        await ctx.kysely
            .insertInto("RecordModerationProcess")
            .values(approved.map(a => {
                return {
                    id: a.id,
                    recordId: a.uri,
                    method: "Automatic",
                    processed_at: new Date(),
                    result: "Ok"
                }
            }))
            .onConflict(oc => oc.column("id").doUpdateSet(eb => ({
                method: eb.ref("excluded.method"),
                result: eb.ref("excluded.result")
            })))
            .execute()
    }
}
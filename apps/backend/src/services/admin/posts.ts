import {AppContext} from "#/setup.js";
import {AppBskyFeedPost} from "@cabildo-abierto/api"


export async function updatePostLangs(ctx: AppContext) {
    const batchSize = 10000
    let curOffset = 0

    while(true){
        ctx.logger.pino.info({offset: curOffset}, "updating post langs batch")
        const res = await ctx.kysely
            .selectFrom("Record")
            .where("Record.collection", "=", "app.bsky.feed.post")
            .select(["Record.uri", "Record.record"])
            .limit(batchSize)
            .offset(curOffset)
            .execute()
        curOffset += res.length

        const values: {
            uri: string
            langs: string[]
        }[] = res.map(r => {
            if(r.record){
                const record = JSON.parse(r.record) as AppBskyFeedPost.Record
                const langs = record.langs ?? []
                return {
                    uri: r.uri,
                    langs
                }
            } else {
                return null
            }
        }).filter(x => x != null)

        await ctx.kysely
            .insertInto("Post")
            .values(values)
            .onConflict((oc) =>
                oc.column("uri").doUpdateSet({
                    langs: (eb) => eb.ref('excluded.langs'),
                })
            )
            .execute()

        if(res.length < batchSize){
            break
        }
    }


}
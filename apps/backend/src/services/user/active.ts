import {AppContext} from "#/setup.js";


export async function updateActiveUsers(ctx: AppContext): Promise<void> {
    console.log("Updating users activity")

    const lastTwoWeeks = new Date(Date.now() - 1000*3600*24*14)
    const lastMonth = new Date(Date.now() - 1000*3600*24*30)

    const t1 = Date.now()
    const usersPostLastTwoWeeks = (await ctx.kysely
        .selectFrom("User")
        .where(eb => eb.exists(
                eb.selectFrom("Record")
                    .whereRef("Record.authorId", "=", "User.did")
                    .where("collection", "=", "app.bsky.feed.post")
                    .where("Record.created_at", ">", lastTwoWeeks)
            )
        )
        .select("did")
        .execute()).map(x => x.did)

    const t2 = Date.now()
    const usersArticleLastMonth = (await ctx.kysely
        .selectFrom("User")
        .where(eb => eb.exists(
                eb.selectFrom("Record")
                    .whereRef("Record.authorId", "=", "User.did")
                    .where("collection", "=", "ar.cabildoabierto.feed.article")
                    .where("Record.created_at", ">", lastMonth)
            )
        )
        .select("did")
        .execute()).map(x => x.did)

    const t3 = Date.now()
    console.log("Active postLastTwoWeeks:", usersPostLastTwoWeeks.length)
    console.log("Active articleLastMonth:", usersArticleLastMonth.length)

    await ctx.kysely.transaction().execute(async db => {
        await db
            .updateTable("User")
            .set("articleLastMonth", false)
            .set("postLastTwoWeeks", false)
            .execute()

        if(usersArticleLastMonth.length > 0){
            await db
                .insertInto("User")
                .values(usersArticleLastMonth.map(x => ({
                    did: x,
                    articleLastMonth: true
                })))
                .onConflict(oc => oc.column("did").doUpdateSet(eb => ({
                    articleLastMonth: eb.ref("excluded.articleLastMonth"),
                })))
                .execute()
        }
        if(usersPostLastTwoWeeks.length > 0){
            await db
                .insertInto("User")
                .values(usersPostLastTwoWeeks.map(x => ({
                    did: x,
                    postLastTwoWeeks: true
                })))
                .onConflict(oc => oc.column("did").doUpdateSet(eb => ({
                    postLastTwoWeeks: eb.ref("excluded.postLastTwoWeeks"),
                })))
                .execute()
        }
    })
    const t4 = Date.now()

    ctx.logger.logTimes("update active users", [t1, t2, t3, t4])
}
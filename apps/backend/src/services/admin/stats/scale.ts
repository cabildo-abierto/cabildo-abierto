import {AppContext} from "#/setup.js";
import {dailyPlotData} from "#/services/admin/stats/utils.js";


export async function getNumberOfCAPostsByDay(ctx: AppContext) {
    const lastMonth = new Date(Date.now() - 1000*3600*24*30)
    const records = await ctx.kysely
        .selectFrom("Record")
        .where("Record.collection", "in", ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"])
        .innerJoin("User", "User.did", "Record.authorId")
        .where("User.inCA", "=", true)
        .select([
            "Record.uri",
            "Record.created_at_tz"
        ])
        .orderBy("Record.created_at_tz asc")
        .where("Record.created_at_tz", ">", lastMonth)
        .execute()

    return dailyPlotData(
        records,
        (x, d) => x.created_at_tz?.toDateString() == d.toDateString(),
        lastMonth
    )
}


export async function getExtendedUsersSize(ctx: AppContext) {
    const res = await ctx.kysely.selectFrom("User")
        .select(eb => eb.fn.countAll<number>().as('count'))
        .where(eb => eb.exists(eb
            .selectFrom("Follow")
            .whereRef("Follow.userFollowedId", "=", "User.did")
            .innerJoin("Record as FollowRecord", "FollowRecord.uri", "Follow.uri")
            .innerJoin("User as FollowAuthor", "FollowAuthor.did", "FollowRecord.authorId")
            .where("FollowAuthor.inCA", "=", true)
        ))
        .executeTakeFirst()

    return res?.count ?? 0
}


// no funciona porque no están sincronizados
export async function getNumberOfPostsByDayOfExtendedUsers(ctx: AppContext) {
    const lastMonth = new Date(Date.now() - 1000*3600*24*30)
    const records = await ctx.kysely
        .with("ExtendedUser", eb => eb
            .selectFrom("User")
            .where(eb => eb.or([
                eb.exists(eb
                    .selectFrom("Follow")
                    .whereRef("Follow.userFollowedId", "=", "User.did")
                    .innerJoin("Record as FollowRecord", "FollowRecord.uri", "Follow.uri")
                    .innerJoin("User as FollowAuthor", "FollowAuthor.did", "FollowRecord.authorId")
                    .where("FollowAuthor.inCA", "=", true)
                ),
                eb("User.inCA", "=", true)
            ]))
            .select("did")
        )
        .selectFrom("Record")
        .where("Record.collection", "in", ["ar.cabildoabierto.feed.article", "app.bsky.feed.post"])
        .innerJoin("ExtendedUser", "ExtendedUser.did", "Record.authorId")
        .select([
            "Record.uri",
            "Record.created_at_tz"
        ])
        .orderBy("Record.created_at_tz asc")
        .where("Record.created_at_tz", ">", lastMonth)
        .execute()

    return dailyPlotData(
        records,
        (x, d) => x.created_at_tz?.toDateString() == d.toDateString(),
        lastMonth
    )
}
import {CAHandler} from "#/utils/handler.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {AppContext} from "#/setup.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {getUsersWithReadSessions} from "#/services/monetization/get-users-with-read-sessions.js";
import {isWeeklyActiveUser} from "#/services/monetization/donations.js";
import {count, listOrderDesc, sortByKey} from "@cabildo-abierto/utils";
import {sql} from "kysely";
import {jsonArrayFrom} from "kysely/helpers/postgres";
import {dailyPlotData} from "#/services/admin/stats/utils.js";


export type StatsDashboard = {
    lastUsers: (ArCabildoabiertoActorDefs.ProfileViewBasic & { lastReadSession: Date | null, CAProfileCreatedAt?: Date | null })[]
    counts: {
        registered: number
        active: number
        verified: number
        verifiedActive: number
    }
    WAUPlot: { date: Date, count: number }[]
    usersPlot: { date: Date, count: number }[]
    WAUPlotVerified: { date: Date, count: number }[]
    articlesPlot: {date: Date, count: number}[]
    topicVersionsPlot: {date: Date, count: number}[]
    caCommentsPlot: {date: Date, count: number}[]
}


export const testUsers = [
    "usuariodepruebas.bsky.social",
    "usuariodepruebas2.bsky.social",
    "usuariodepruebas3.bsky.social",
    "usuariodepruebas4.bsky.social",
    "usuariodepruebas5.bsky.social",
    "usuariodepruebas6.bsky.social",
    "usuariodepruebas7.bsky.social",
    "usuariodepruebas8.bsky.social",
    "usuariodepruebas9.bsky.social",
    "carlitos-tester.bsky.social",
    "pruebaprueba.bsky.social"
]


async function getRegisteredUsers(ctx: AppContext, agent: SessionAgent): Promise<StatsDashboard["lastUsers"]> {
    const users = await ctx.kysely
        .selectFrom("User")
        .leftJoin("Record as CAProfile", "CAProfile.uri", "User.CAProfileUri")
        .select([
            "did",
            "User.created_at_tz",
            "userValidationHash",
            "orgValidation",
            eb => jsonArrayFrom(eb
                .selectFrom("ReadSession")
                .select("created_at_tz")
                .whereRef("ReadSession.userId", "=", "User.did")
                .orderBy("ReadSession.created_at_tz desc")
            ).as("readSessions"),
            "CAProfile.created_at_tz as CAProfileCreatedAt"
        ])
        .where("User.inCA", "=", true)
        .where("User.hasAccess", "=", true)
        .where("User.handle", "not in", testUsers)
        .execute()

    const dataplane = new Dataplane(ctx, agent)
    await dataplane.fetchProfileViewBasicHydrationData(users.map(u => u.did))

    const profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[] = users.map(u => hydrateProfileViewBasic(ctx, u.did, dataplane)).filter(u => u != null)
    return sortByKey(profiles.map(p => {
        const user = users.find(u => u.did == p.did)
        if (user) {
            return {
                ...p,
                CAProfileCreatedAt: user.CAProfileCreatedAt,
                lastReadSession: user.readSessions.length > 0 ? user?.readSessions[0].created_at_tz : null,
                createdAt: user.created_at_tz?.toString(),
            }
        }
        return null
    }).filter(u => u != null), e => {
        return e?.lastReadSession ?
            [new Date(e.lastReadSession).getTime()] :
            [0]
    }, listOrderDesc)
}




async function getWAUPlot(ctx: AppContext, verified: boolean) {
    const after = new Date(0)
    const users = await getUsersWithReadSessions(ctx, after, verified)

    const data = dailyPlotData(
        users,
        (u, d) => isWeeklyActiveUser(ctx, u, d)
    )
    return {
        WAUPlot: data,
        active: data[data.length-1].count
    }
}


async function getTopicVersionsPlot(ctx: AppContext) {
    const tv = await ctx.kysely
        .selectFrom("TopicVersion")
        .innerJoin("Record", "TopicVersion.uri", "Record.uri")
        .select("Record.created_at")
        .where("authorId", "!=", "cabildoabierto.ar")
        .execute()

    return dailyPlotData(
        tv,
        (x, d) => x.created_at.toDateString() == d.toDateString()
    )
}


async function getArticlesPlot(ctx: AppContext) {
    const tv = await ctx.kysely
        .selectFrom("Record")
        .select("created_at")
        .where("collection", "=", "ar.cabildoabierto.feed.article")
        .execute()

    return dailyPlotData(
        tv,
        (x, d) => x.created_at.toDateString() == d.toDateString()
    )
}


async function getCACommentsPlot(ctx: AppContext) {
    const tv = await ctx.kysely
        .selectFrom("Post")
        .innerJoin("Record", "Record.uri", "Post.uri")
        .innerJoin("Record as Root", "Root.uri", "Post.rootId")
        .select("Record.created_at")
        .where("Root.collection", "in", ["ar.cabildoabierto.feed.article", "ar.cabildoabierto.wiki.topicVersion"])
        .execute()

    return dailyPlotData(
        tv,
        (x, d) => x.created_at.toDateString() == d.toDateString()
    )
}


async function getUsersPlot(ctx: AppContext, users: StatsDashboard["lastUsers"]){
    return dailyPlotData(
        users,
        (x, d) => x.CAProfileCreatedAt != null && new Date(x.CAProfileCreatedAt) <= getEndOfDay(d)
    )
}


function getEndOfDay(date: Date) {
    const endOfDay = new Date(date); // clone the date
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
}


export const getStatsDashboard: CAHandler<{}, StatsDashboard> = async (ctx, agent, {}) => {

    const [
        lastUsers,
        {WAUPlot, active},
        {WAUPlot: WAUPlotVerified, active: verifiedActive},
        topicVersionsPlot,
        caCommentsPlot,
        articlesPlot,
    ] = await Promise.all([
        getRegisteredUsers(ctx, agent),
        getWAUPlot(ctx, false),
        getWAUPlot(ctx, true),
        getTopicVersionsPlot(ctx),
        getCACommentsPlot(ctx),
        getArticlesPlot(ctx),
    ])

    const usersPlot = await getUsersPlot(ctx, lastUsers)

    return {
        data: {
            lastUsers,
            WAUPlot,
            usersPlot,
            WAUPlotVerified,
            counts: {
                active,
                verified: count(lastUsers, u => u.verification != null),
                verifiedActive,
                registered: lastUsers.length
            },
            topicVersionsPlot,
            caCommentsPlot,
            articlesPlot,
        }
    }
}


export type ActivityStats = {
    did: string
    handle: string
    articles: number
    topicVersions: number
    enDiscusion: number
}


export const getActivityStats: CAHandler<{}, ActivityStats[]> = async (ctx, agent, {}) => {

    const results = await ctx.kysely
        .selectFrom('User')
        .leftJoin('Record', 'Record.authorId', 'User.did')
        .innerJoin("Content", "Content.uri", "Record.uri")
        .leftJoin("PaymentPromise", "PaymentPromise.contentId", "Record.uri")
        .select([
            'User.did',
            'User.handle',
            ctx.kysely.fn
                .count<number>(sql`case when "Record".collection = 'app.bsky.feed.post' and 'ca:en discusión' = ANY("Content"."selfLabels") then 1 end`)
                .as('enDiscusion'),
            ctx.kysely.fn
                .count<number>(sql`case when "Record".collection = 'ar.cabildoabierto.feed.article' then 1 end`)
                .as('articles'),
            ctx.kysely.fn
                .count<number>(sql`case when "Record".collection = 'ar.cabildoabierto.wiki.topicVersion' then 1 end`)
                .as('topicVersions'),
            ctx.kysely.fn
                .sum<number>("PaymentPromise.amount")
                .as('income')
        ])
        .where('User.inCA', '=', true)
        .groupBy(['User.did', 'User.handle'])
        .execute()

    const stats: ActivityStats[] = []

    results.forEach(s => {
        if(s.handle){
            stats.push({
                ...s,
                handle: s.handle
            })
        }
    })

    return {data: stats}
}



export const getReadSessionsPlot: CAHandler<{}, {date: Date, count: number}[]> = async (ctx, agent, params) => {
    const reads = await ctx.kysely
        .selectFrom("ReadSession")
        .select(["created_at_tz"])
        .execute()

    const data = dailyPlotData(reads,
        (x, d) => x.created_at_tz != null && new Date(x.created_at_tz).toDateString() == new Date(d).toDateString())

    return {
        data
    }
}
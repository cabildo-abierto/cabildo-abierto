import {CAHandler} from "#/utils/handler.js";
import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from "uuid";
import {NotificationType} from "../../../prisma/generated/types.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {sortByKey, unique} from "@cabildo-abierto/utils";
import {sortDatesDescending} from "@cabildo-abierto/utils";
import {SessionAgent} from "#/utils/session-agent.js";
import {getDidFromUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoNotificationListNotifications} from "@cabildo-abierto/api"


export type NotificationQueryResult = {
    id: string
    userNotifiedId: string
    causedByRecordId: string
    cid: string | null
    record: string | null
    message: string | null
    moreContext: string | null
    created_at: Date
    type: NotificationType
    reasonSubject: string | null
    topicId: string | null
}


function hydrateCANotification(ctx: AppContext, id: string, dataplane: Dataplane, lastReadTime: Date): ArCabildoabiertoNotificationListNotifications.Notification | null {
    const data = dataplane.notifications.get(id)
    if (!data) {
        console.log(`No hydration data for notification: ${id}`)
        return null
    }

    if (!data.cid) {
        console.log(`No cid for notification: ${id}`)
        return null
    }

    const author = hydrateProfileViewBasic(ctx, getDidFromUri(data.causedByRecordId), dataplane)
    if (!author) {
        console.log(`No author hydration data for notification: ${id}`)
        return null
    }

    let reason: ArCabildoabiertoNotificationListNotifications.Notification["reason"]
    if (data.type == "Reply") {
        reason = "reply"
    } else if (data.type == "Mention") {
        reason = "mention"
    } else if (data.type == "TopicEdit") {
        reason = "topic-edit"
    } else {
        reason = "topic-version-vote"
    }

    return {
        $type: "ar.cabildoabierto.notification.listNotifications#notification",
        reason,
        uri: data.causedByRecordId,
        cid: data.cid,
        author: {
            ...author,
            $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
        },
        record: data.record ? JSON.parse(data.record) : undefined,
        isRead: data.created_at < lastReadTime,
        indexedAt: data.created_at.toISOString(),
        reasonSubject: data.reasonSubject ?? undefined,
        reasonSubjectContext: data.topicId ?? undefined
    }
}


export type NotificationsSkeleton = {
    id: string
    causedByRecordId: string
    reasonSubject: string | null
}[]


async function getCANotifications(ctx: AppContext, agent: SessionAgent): Promise<ArCabildoabiertoNotificationListNotifications.Notification[]> {
    const dataplane = new Dataplane(ctx, agent)

    const [skeleton, lastSeen] = await Promise.all([
        ctx.kysely
            .selectFrom("Notification")
            .innerJoin("Record", "Notification.causedByRecordId", "Record.uri")
            .select([
                "Notification.id",
                "Notification.causedByRecordId",
                "Notification.reasonSubject"
            ])
            .where("Notification.userNotifiedId", "=", agent.did)
            .orderBy("Notification.created_at_tz", "desc")
            .limit(20)
            .execute(),
        ctx.kysely
            .selectFrom("User")
            .select("lastSeenNotifications_tz")
            .where("did", "=", agent.did)
            .execute()
    ])

    await dataplane.fetchNotificationsHydrationData(skeleton)

    const lastReadTime = lastSeen[0].lastSeenNotifications_tz ?? new Date(0)

    return skeleton
        .map(n => hydrateCANotification(ctx, n.id, dataplane, lastReadTime))
        .filter(n => n != null)
}


async function updateSeenCANotifications(ctx: AppContext, agent: SessionAgent) {
    await ctx.kysely
        .updateTable("User")
        .set("lastSeenNotifications", new Date())
        .set("lastSeenNotifications_tz", new Date())
        .where("did", "=", agent.did)
        .execute()
}


export const getNotifications: CAHandler<{}, ArCabildoabiertoNotificationListNotifications.Notification[]> = async (ctx, agent, {}) => {
    const [{data}, caNotifications] = await Promise.all([
        agent.bsky.app.bsky.notification.listNotifications(),
        getCANotifications(ctx, agent),
        agent.bsky.app.bsky.notification.updateSeen({seenAt: new Date().toISOString()}),
        updateSeenCANotifications(ctx, agent)
    ])

    const bskyNotifications: ArCabildoabiertoNotificationListNotifications.Notification[] = data.notifications.map(n => ({
        ...n,
        author: {
            ...n.author,
            verification: undefined, // TO DO
            $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
        },
        $type: "ar.cabildoabierto.notification.listNotifications#notification"
    }))

    const notifications = sortByKey(
        [...bskyNotifications, ...caNotifications],
        a => a.indexedAt,
        sortDatesDescending
    )

    return {data: notifications}
}


export const getUnreadNotificationsCount: CAHandler<{}, number> = async (ctx, agent, {}) => {
    // queremos la cantidad de notificaciones no leídas entre CA y Bluesky
    // el punto clave es la timestamp de última lectura
    // va a haber dos timesamps:
    //  - última lectura en Bluesky O Cabildo Abierto
    //  - última lectura en Cabildo Abierto
    // la primera la maneja Bluesky, y la actualizamos desde CA también
    // la segunda es nuestra
    // en consecuencia, al ver las notificaciones en CA puede ser que se intercalen notificaciones leídas con no leídas
    // si la última lectura en Bluesky fue más reciente que la última lectura en CA

    const {data} = await agent.bsky.app.bsky.notification.getUnreadCount()

    const result = await ctx.kysely
        .selectFrom('Notification')
        .select(({fn}) => [fn.count('id').as('count')])
        .where('userNotifiedId', '=', agent.did)
        .where('created_at', '>', (eb) =>
            eb
                .selectFrom('User')
                .select('lastSeenNotifications')
                .where('did', '=', agent.did)
        )
        .executeTakeFirst()

    const caUnreadCount = Number(result?.count ?? 0)

    return {data: data.count + caUnreadCount}
}


export type NotificationJobData = (Omit<FullNotification, "type"> & {type: "Reply"}) | TopicVersionVoteNotification | TopicEditNotification | MentionNotification


type FullNotification = {
    userNotifiedId: string
    type: NotificationType
    causedByRecordId: string
    message?: string
    moreContext?: string
    created_at: Date
    reasonSubject?: string
}

type TopicVersionVoteNotification = {
    type: "TopicVersionVote"
    uri: string
    subjectId: string
    topic: string
}

type TopicEditNotification = {
    type: "TopicEdit"
    uri: string
}

type MentionNotification = {
    type: "Mention"
    uri: string
    handle: string
}


async function getTopicEditsFullNotifications(ctx: AppContext, data: TopicEditNotification[]): Promise<FullNotification[]> {
    if (data.length == 0) return []

    let relatedUris = await ctx.kysely
        .with('InputVersions', (qb) =>
            qb
                .selectFrom('TopicVersion')
                .innerJoin("Record", "Record.uri", "TopicVersion.uri")
                .select(['Record.uri', 'topicId', "Record.created_at"])
                .where('Record.uri', 'in', data.map(d => d.uri))
        )
        .selectFrom("InputVersions")
        .innerJoin('TopicVersion as tv', 'InputVersions.topicId', 'tv.topicId')
        .innerJoin("Record as tvRecord", "tvRecord.uri", "InputVersions.uri")
        .whereRef("InputVersions.created_at", ">", "tvRecord.created_at")
        .select([
            'InputVersions.uri as causeUri',
            'tv.uri as notifiedVersionUri',
            'tv.topicId as topicId',
        ])
        .execute()

    // no notificamos dos veces a un usuario que editó dos veces el mismo tema
    relatedUris = unique(relatedUris, e => `${e.causeUri}:${getDidFromUri(e.notifiedVersionUri)}`)

    // no notificamos al usuario que editó
    relatedUris = relatedUris.filter(e => getDidFromUri(e.notifiedVersionUri) != getDidFromUri(e.causeUri))

    return relatedUris.map((v, i) => {
        return {
            created_at: new Date(),
            type: "TopicEdit",
            causedByRecordId: v.causeUri,
            reasonSubject: v.topicId,
            userNotifiedId: getDidFromUri(v.notifiedVersionUri)
        }
    })
}


async function getTopicVersionVoteFullNotifications(ctx: AppContext, data: TopicVersionVoteNotification[]): Promise<FullNotification[]> {
    if (data.length == 0) return []

    let notifications: FullNotification[] = data.map((d, i) => {
        return {
            created_at: new Date(),
            type: "TopicVersionVote",
            causedByRecordId: d.uri,
            reasonSubject: d.topic,
            userNotifiedId: getDidFromUri(d.subjectId)
        }
    })

    notifications = notifications.filter(v =>
        getDidFromUri(v.causedByRecordId) != v.userNotifiedId
    )

    return notifications
}


async function createFullNotifications(ctx: AppContext, data: FullNotification[]) {
    data = unique(data, v => `${v.userNotifiedId}:${v.causedByRecordId}`)

    if(data.length > 0){
        await ctx.kysely
            .insertInto("Notification")
            .values(data.map(d => ({
                id: uuidv4(),
                ...d
            })))
            .onConflict(cb => cb.doNothing())
            .execute()
    }
}


async function getMentionsFullNotifications(ctx: AppContext, data: MentionNotification[]) : Promise<FullNotification[]> {
    if(data.length == 0) return []

    const dids = await ctx.kysely
        .selectFrom("User")
        .select(["did", "handle"])
        .where("User.handle", "in", data.map(d => d.handle))
        .execute()

    const handleToDidArray: [string, string][] = dids
        .map((d) : [string, string] | null => (d.handle ? [d.handle, d.did] : null))
        .filter(x => x != null)

    const handleToDid = new Map<string, string>(handleToDidArray)

    return data.map(d => {
        const userNotifiedId = handleToDid.get(d.handle)
        if(!userNotifiedId) return null
        const n: FullNotification = {
            type: "Mention",
            userNotifiedId,
            causedByRecordId: d.uri,
            created_at: new Date()
        }
        return n
    }).filter(x => x != null)
}


export const createNotificationsJob = async (ctx: AppContext, data: NotificationJobData[]) => {
    const topicEdits = await getTopicEditsFullNotifications(ctx, data.filter(d => d.type == "TopicEdit"))
    const topicVersionVotes = await getTopicVersionVoteFullNotifications(ctx, data.filter(d => d.type == "TopicVersionVote"))
    const mentions = await getMentionsFullNotifications(ctx, data.filter(d => d.type == "Mention"))

    const fullNotifications = [
        ...topicEdits,
        ...topicVersionVotes,
        ...mentions,
        ...data.filter(d => d.type != "TopicVersionVote" && d.type != "TopicEdit" && d.type != "Mention")
    ]

    ctx.logger.pino.info({data, fullNotifications}, "creating notifications")

    await createFullNotifications(ctx, fullNotifications)
}

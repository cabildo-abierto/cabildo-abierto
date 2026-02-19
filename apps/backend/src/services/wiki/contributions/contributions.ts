import {AppContext} from "#/setup.js";
import {DataPlane, getBlobKey} from "#/services/hydration/dataplane.js";
import {BlobRef} from "#/services/hydration/hydrate.js";
import {nodesCharDiff} from "#/services/wiki/diff.js";
import {decompress} from "@cabildo-abierto/editor-core";
import {unique} from "@cabildo-abierto/utils";
import {getTopicVersionStatusFromReactions} from "#/services/monetization/author-dashboard.js";
import {getNumWords} from "#/services/wiki/content.js";
import {sql} from "kysely";
import {EditorStatus} from "@cabildo-abierto/api";
import {Effect} from "effect";
import {DBInsertError, DBSelectError} from "#/utils/errors.js";
import {FetchBlobError} from "#/services/blob.js";


type TopicVersion = {
    uri: string
    topicId: string
    authorship: boolean
    protection: EditorStatus
    text: string | null
    format: string | null
    dbFormat: string | null
    textBlobId: string | null
    authorId: string
    editorStatus: EditorStatus
    created_at: Date | null
    reactions: {
        uri: string
        editorStatus: string
    }[] | null
}


const getMarkdown = (v: TopicVersion): Effect.Effect<string | null, never, DataPlane> => Effect.gen(function* () {
    let text: string | null = v.text
    let format = v.dbFormat

    const dataplane = yield* DataPlane

    if (!v.text && v.textBlobId) {
        text = dataplane.getState().textBlobs.get(getBlobKey({
            cid: v.textBlobId,
            authorId: v.authorId
        }))!
        format = v.format
    }
    if (text == null) return null

    if (format == "markdown-compressed") {
        return decompress(text)
    } else if (format == "lexical-compressed" || !format) {
        try {
            const lexical = decompress(text)
            if (lexical.length == 0) {
                return ""
            } else {
                return null
            }
        } catch {
            console.log("Failed to decompress lexical content", text)
            return null
        }
    } else if (format == "plain-text") {
        return v.text
    } else if (format == "markdown") {
        return text
    } else {
        return null
    }
})


export function updateAllTopicContributions(ctx: AppContext) {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .select("id")
            .execute().then(topics => topics.map(t => t.id)),
        catch: () => new DBSelectError()
    }).pipe(
        Effect.flatMap(topicIds => {
            return updateTopicContributions(ctx, topicIds)
        }),
        Effect.withSpan("updateAllTopicContributions")
    )
}


type TopicVersionContrUpdate = {
    uri: string
    topicId: string
    charsAdded: number
    charsDeleted: number
    accCharsAdded: number
    monetizedContribution?: number
    charsContribution?: number
    diff: string
    prevAcceptedUri: string | undefined
    accepted: boolean
}

type ContentUpd = {
    uri: string
    numWords: number
    text: string
    dbFormat: string
}


const fetchVersionsData = (
    ctx: AppContext,
    topicIds: string[]
): Effect.Effect<TopicVersion[], DBSelectError, DataPlane> => {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("TopicVersion as tv")
            .innerJoin("Topic as t", "t.id", "tv.topicId")
            .innerJoin("Content as c", "c.uri", "tv.uri")
            .innerJoin("Record as r", "r.uri", "tv.uri")
            .innerJoin("User as u", "u.did", "r.authorId")
            .leftJoin("Reaction", "Reaction.subjectId", "tv.uri")
            .leftJoin("Record as ReactionRecord", "Reaction.uri", "ReactionRecord.uri")
            .leftJoin("User as ReactionAuthor", "ReactionAuthor.did", "ReactionRecord.authorId")
            .select([
                "tv.uri",
                "tv.topicId",
                "tv.authorship",
                "t.protection",
                "c.text",
                "c.format",
                "c.dbFormat",
                "c.textBlobId",
                "r.authorId",
                "u.editorStatus",
                "r.created_at_tz as created_at",
                eb => eb.fn.jsonAgg(
                    sql<{ uri: string; editorStatus: string }>`json_build_object
                    ('uri', "Reaction"."uri", 'editorStatus', "ReactionAuthor"."editorStatus")`
                ).filterWhere("Reaction.uri", "is not", null).as("reactions")
            ])
            .groupBy([
                "tv.uri",
                "tv.topicId",
                "t.id",
                "tv.authorship",
                "t.protection",
                "c.text",
                "c.format",
                "c.dbFormat",
                "c.textBlobId",
                "r.authorId",
                "u.editorStatus",
                "r.created_at_tz"
            ])
            .where("t.id", "in", topicIds)
            .orderBy("r.created_at_tz asc")
            .execute(),
        catch: () => new DBSelectError()
    })
}


const applyUpdates = (
    ctx: AppContext,
    tvUpdates: TopicVersionContrUpdate[],
    contentUpdates: ContentUpd[]
): Effect.Effect<void, DBInsertError> => Effect.gen(function* () {

    if (tvUpdates.length > 0) {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("TopicVersion")
                .values(tvUpdates)
                .onConflict((oc) => oc.column('uri').doUpdateSet((eb) => ({
                    charsAdded: eb.ref('excluded.charsAdded'),
                    charsDeleted: eb.ref('excluded.charsDeleted'),
                    accCharsAdded: eb.ref('excluded.accCharsAdded'),
                    monetizedContribution: eb.ref("excluded.monetizedContribution"),
                    charsContribution: eb.ref("excluded.charsContribution"),
                    diff: eb.ref('excluded.diff'),
                    prevAcceptedUri: eb.ref('excluded.prevAcceptedUri'),
                    accepted: eb.ref("excluded.accepted")
                })))
                .execute(),
            catch: () => new DBInsertError("TopicVersion")
        })
    }
    if (contentUpdates.length > 0) {
        yield* Effect.tryPromise({
            try: () => ctx.kysely
                .insertInto("Content")
                .values(contentUpdates.map(c => ({
                    ...c,
                    selfLabels: [],
                    embeds: []
                })))
                .onConflict((oc) => oc.column('uri').doUpdateSet((eb) => ({
                    numWords: eb.ref('excluded.numWords'),
                })))
                .execute(),
            catch: () => new DBInsertError("Content")
        })
    }
})


const getContributionUpdatesForVersionsOfTopic = (
    ctx: AppContext,
    topicId: string,
    topicVersions: TopicVersion[]
): Effect.Effect<{
    versionUpdates: TopicVersionContrUpdate[],
    versionContentUpdates: ContentUpd[]
}, never, DataPlane> => Effect.gen(function* () {
    let prev = ""
    let accCharsAdded = 0
    let monetizedCharsAdded = 0
    let prevAccepted = undefined
    const versionUpdates: TopicVersionContrUpdate[] = []
    const versionContentUpdates: ContentUpd[] = []

    const acceptedMap = new Map<string, boolean>()

    let acceptedVersions = 0
    for (let i = 0; i < topicVersions.length; i++) {
        const v = topicVersions[i]
        const status = getTopicVersionStatusFromReactions(
            ctx,
            v.reactions?.map(r => ({uri: r.uri, editorStatus: r.editorStatus})) ?? [],
            v.editorStatus,
            v.protection
        )

        acceptedMap.set(v.uri, status.accepted)
        if (status.accepted) acceptedVersions++

        let markdown = yield* getMarkdown(v)
        if (markdown == null) {
            ctx.logger.pino.warn({uri: v.uri}, "couldn't find markdown for topic version")
            markdown = ""
        }

        const d = nodesCharDiff(
            prev.split("\n\n"),
            markdown.split("\n\n")
        )

        if (!status.accepted) {
            versionUpdates.push({
                uri: v.uri,
                charsAdded: d.charsAdded,
                charsDeleted: d.charsDeleted,
                accCharsAdded: accCharsAdded,
                diff: JSON.stringify(d),
                topicId,
                prevAcceptedUri: prevAccepted,
                accepted: false
            })
            versionContentUpdates.push({
                uri: v.uri,
                numWords: getNumWords(markdown, "markdown"),
                text: markdown,
                dbFormat: "markdown"
            })
            prev = markdown
            continue
        }

        accCharsAdded += d.charsAdded
        if (v.authorship) {
            monetizedCharsAdded += d.charsAdded
        }
        versionUpdates.push({
            uri: v.uri,
            charsAdded: d.charsAdded,
            charsDeleted: d.charsDeleted,
            accCharsAdded: accCharsAdded,
            diff: JSON.stringify(d),
            topicId,
            prevAcceptedUri: prevAccepted,
            accepted: true,
        })
        versionContentUpdates.push({
            uri: v.uri,
            numWords: getNumWords(markdown, "markdown"),
            text: markdown,
            dbFormat: "markdown"
        })
        prev = markdown
        prevAccepted = v.uri
    }

    if (versionUpdates.length != topicVersions.length) throw Error("Faltan updates!")

    for (let i = 0; i < topicVersions.length; i++) {
        let monetized = 0
        const accepted = acceptedMap.get(versionUpdates[i].uri)
        if (accepted) {
            if (topicVersions[i].authorship && monetizedCharsAdded > 0) {
                monetized += (versionUpdates[i].charsAdded / monetizedCharsAdded) * 0.9
            }
            if (monetizedCharsAdded) {
                monetized += 0.1 / acceptedVersions
            } else {
                monetized += 1.0 / acceptedVersions
            }
        }

        const chars = accCharsAdded == 0 ? 1.0 / 0 : versionUpdates[i].charsAdded / accCharsAdded
        versionUpdates[i].monetizedContribution = monetized
        versionUpdates[i].charsContribution = chars

        ctx.logger.pino.info({uri: topicVersions[i].uri, monetized, chars}, "contribution of version")
    }

    return {versionUpdates, versionContentUpdates}
})

export function updateTopicContributionsRequired(ctx: AppContext) {
    return Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("TopicVersion")
            .where("TopicVersion.charsAdded", "is", null)
            .select("topicId")
            .execute(),
        catch: () => new DBSelectError()
    }).pipe(
        Effect.map(tv => unique(tv.map(t => t.topicId))),
        Effect.flatMap(topicIds => updateTopicContributions(ctx, topicIds))
    )
}


export const updateTopicContributions = (
    ctx: AppContext,
    topicIds: string[]
): Effect.Effect<void, DBInsertError | DBSelectError | FetchBlobError, DataPlane> => Effect.gen(function* () {
    const batchSize = 500
    if (topicIds.length > batchSize) {
        for (let i = 0; i < topicIds.length; i += batchSize) {
            yield* updateTopicContributions(ctx, topicIds.slice(i, i + batchSize))
        }
        return
    }

    if (!topicIds || !(topicIds instanceof Array) || topicIds.length == 0) return

    const versions = yield* fetchVersionsData(ctx, topicIds)

    const blobRefs: BlobRef[] = versions.map(e => {
        if (!e.textBlobId) return null
        if (e.text != null) return null
        return {
            cid: e.textBlobId,
            authorId: e.authorId
        }
    }).filter(x => x != null)

    const dataplane = yield* DataPlane
    yield* dataplane.dpFetchTextBlobs(blobRefs)

    const versionsByTopic = new Map<string, TopicVersion[]>()
    versions.forEach(v => {
        versionsByTopic.set(v.topicId, [...(versionsByTopic.get(v.topicId) ?? []), v])
    })

    const updates = yield* Effect.all(Array.from(versionsByTopic.entries()).map(([topicId, topicVersions]) => {
        return getContributionUpdatesForVersionsOfTopic(
            ctx,
            topicId,
            topicVersions
        )
    }))

    yield* applyUpdates(
        ctx,
        updates.flatMap(x => x.versionUpdates),
        updates.flatMap(x => x.versionContentUpdates)
    )
})
import {AppContext} from "#/setup.js";
import {getCollectionEnumFromUri, getCollectionFromUri, getDidFromUri, isRepost, unique} from "@cabildo-abierto/utils";
import {CollectionEnum} from "@cabildo-abierto/api";
import {Transaction} from "kysely";
import {DB} from "../../../../prisma/generated/types.js";


type FollowingFeedIndexUpdate = {
    contentId: string
    repostedContentId: string | null
    readerId: string
    collection: CollectionEnum
    authorInCA: boolean
    created_at: Date
    rootId: string
    authorId: string
}


/*
    Idea:
     - Por cada post, para cada uno de los seguidores actualizamos el feed de la siguiente manera.
     - Si es un root, se inserta.
     - Si no, se mira el root. Si el autor es seguido por el usuario:
        - Si no existe: se inserta.
        - Si existe lo reemplazamos.
*/

export class FeedIndexUpdater {
    ctx: AppContext
    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    async getUpdatesFromRecords(followersMap: Map<string, Set<string>>, since: Date) {
        const authorIds = Array.from(followersMap.keys())

        const records = await this.ctx.kysely
            .selectFrom("Record")
            .innerJoin("User", "User.did", "Record.authorId")
            .leftJoin("Post", "Post.uri", "Record.uri")
            .leftJoin("Record as RootRecord", "RootRecord.uri", "Post.rootId")
            .leftJoin("User as RootAuthor", "RootAuthor.did", "RootRecord.authorId")
            .where(eb => eb.or([
                eb("Record.created_at_tz", ">", since),
                eb("Record.collection", "=", "ar.cabildoabierto.feed.article")
            ]))
            .where("User.did", "in", authorIds)
            .where("Record.collection", "in", [
                "app.bsky.feed.post",
                "ar.cabildoabierto.feed.article"
            ])
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "User.inCA",
                "Post.rootId"
            ])
            .orderBy("Record.created_at_tz", "asc")
            .execute()

        const readers = Array.from(followersMap.values()).flatMap(f => Array.from(f))

        const follows = await this.ctx.kysely
            .selectFrom("Follow")
            .innerJoin("Record", "Record.uri", "Follow.uri")
            .where("Record.authorId", "in", readers)
            .select(["Follow.uri", "Follow.userFollowedId"])
            .execute()

        const followsSet = new Set<string>(follows.map(f => {
            return `${f.userFollowedId}:${getDidFromUri(f.uri)}`
        }))

        const values: FollowingFeedIndexUpdate[] = []
        records.forEach(r => {
            const followers = followersMap.get(getDidFromUri(r.uri))
            if (followers) {
                followers.forEach(readerId => {
                    if (r.created_at) {
                        const authorId = getDidFromUri(r.uri)
                        const rootId = r.rootId ?? r.uri
                        if (!r.rootId || followsSet.has(`${getDidFromUri(r.rootId)}:${readerId}`)) {
                            values.push({
                                contentId: r.uri,
                                repostedContentId: null,
                                readerId,
                                collection: getCollectionEnumFromUri(r.uri),
                                authorInCA: r.inCA,
                                created_at: r.created_at,
                                rootId,
                                authorId
                            })
                        }
                    }
                })
            }
        })
        return values
    }

    async getUpdatesFromReposts(followersMap: Map<string, Set<string>>, since: Date) {
        const authorIds = Array.from(followersMap.keys())
        const reposts = await this.ctx.kysely
            .selectFrom("Record")
            .innerJoin("User", "User.did", "Record.authorId")
            .innerJoin("Reaction", "Reaction.uri", "Record.uri")
            .innerJoin("Record as RepostedRecord", "Reaction.subjectId", "RepostedRecord.uri")
            .leftJoin("Content as RepostedRecordContent", "RepostedRecordContent.uri", "RepostedRecord.uri")
            .leftJoin("Post", "Post.uri", "RepostedRecord.uri")
            .where(eb => eb.or([
                eb("Record.created_at_tz", ">", since),
                eb("Record.collection", "=", "ar.cabildoabierto.feed.article")
            ]))
            .where("User.did", "in", authorIds)
            .where("Record.collection", "=", "app.bsky.feed.repost")
            .where("RepostedRecordContent.uri", "is not", null)
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "RepostedRecord.uri as repostedContentId",
                "User.inCA",
                "Post.rootId"
            ])
            .orderBy("Record.created_at_tz", "asc")
            .execute()

        const values: FollowingFeedIndexUpdate[] = []
        reposts.forEach(r => {
            const followers = followersMap.get(getDidFromUri(r.uri))
            if (followers) {
                followers.forEach(readerId => {
                    if (r.created_at) {
                        values.push({
                            contentId: r.uri,
                            repostedContentId: r.repostedContentId,
                            readerId,
                            collection: getCollectionEnumFromUri(r.repostedContentId),
                            authorInCA: r.inCA,
                            created_at: r.created_at,
                            rootId: r.rootId ?? r.repostedContentId,
                            authorId: getDidFromUri(r.uri)
                        })
                    }
                })
            }
        })
        return values
    }

    async addContentsForFollowersMap(followersMap: Map<string, Set<string>>, since: Date) {
        const recordUpdates = await this.getUpdatesFromRecords(followersMap, since)
        const repostUpdates = await this.getUpdatesFromReposts(followersMap, since)
        const updates = [...recordUpdates, ...repostUpdates]

        if(updates.length > 0) {
            const bs = 5000
            for(let i = 0; i < updates.length; i += bs) {
                this.ctx.logger.pino.info({i}, "batch")
                await this.ctx.kysely.transaction().execute(async trx => {
                    await trx
                        .insertInto("FollowingFeedIndex")
                        .values(updates.slice(i, i + bs))
                        .onConflict((oc) => oc.columns(["readerId", "contentId"]).doNothing())
                        .execute()

                    await this.keepLatestWithRoot(trx)
                })
            }
        }
    }

    async populate(dids: string[], since: Date) {
        const followersMap = await this.getFollowersMap(dids)
        await this.addContentsForFollowersMap(followersMap, since)
    }

    async getFollowersMap(dids: string[]) {
        const follows = (await this.ctx.kysely
            .selectFrom("Follow")
            .innerJoin("Record", "Record.uri", "Follow.uri")
            .where("Record.authorId", "in", dids)
            .select(["Follow.userFollowedId", "Follow.uri"])
            .execute()).filter(x => x != null)

        const followersMap = new Map<string, Set<string>>()
        follows.forEach(r => {
            if (!r.userFollowedId) return
            const cur = followersMap.get(r.userFollowedId)
            if (cur) {
                cur.add(getDidFromUri(r.uri))
            } else {
                followersMap.set(r.userFollowedId, new Set([getDidFromUri(r.uri)]))
            }
        })

        return followersMap
    }

    getFeedStartDate() {
        return new Date(Date.now() - 1000 * 3600 * 24 * 30 * 2)
    }

    async updateOnFollowChange(data: { follower: string, followed: string }[]) {
        if(data.length == 0) return
        const ctx = this.ctx
        await ctx.kysely.transaction().execute(async trx => {
            const follows = await trx
                .selectFrom("Follow")
                .innerJoin("Record", "Record.uri", "Follow.uri")
                .where(({eb, refTuple, tuple}) =>
                    eb(
                        refTuple('Record.authorId', 'userFollowedId'),
                        'in',
                        data.map((r) => tuple(r.follower, r.followed))
                    )
                )
                .select(["Record.authorId as follower", "Follow.userFollowedId as followed"])
                .execute()
            const following = data.filter(x => {
                return follows.some(y => y.follower === x.follower && y.followed === x.followed)
            })
            if (following.length > 0) {
                const m = new Map<string, Set<string>>()
                following.forEach(f => {
                    const cur = m.get(f.follower)
                    if (cur) {
                        cur.add(f.follower)
                    } else {
                        m.set(f.followed, new Set([f.follower]))
                    }
                })

                await this.addContentsForFollowersMap(m, this.getFeedStartDate())
            }

            const notFollowing = data.filter(x => {
                return !follows.some(y => y.follower === x.follower && y.followed === x.followed)
            })
            if (notFollowing.length > 0) {
                try {
                    await trx
                        .deleteFrom("FollowingFeedIndex")
                        .where(({eb, refTuple, tuple}) =>
                            eb(
                                refTuple('FollowingFeedIndex.readerId', 'FollowingFeedIndex.authorId'),
                                'in',
                                notFollowing.map((r) => tuple(r.follower, r.followed))
                            )
                        )
                        .execute()
                } catch (error) {
                    ctx.logger.pino.error({error}, "error deleting from following feed index")
                    throw error
                }
            }
        })
    }

    async updateOnNewContents(uris: string[]) {
        await this.ctx.kysely.transaction().execute(async trx => {
            const authors = unique(uris.map(getDidFromUri))
            if(uris.length == 0) return
            const followers = await trx
                .selectFrom("Follow")
                .innerJoin("Record", "Record.uri", "Follow.uri")
                .innerJoin("User", "User.did", "Record.authorId")
                .where("User.inCA", "=", true)
                .where("Follow.userFollowedId", "in", authors)
                .select(["Follow.uri", "Follow.userFollowedId"])
                .execute()

            const reposts = uris.filter(u => isRepost(getCollectionFromUri(u)))

            const records = uris
                .filter(u => !isRepost(getCollectionFromUri(u)))

            const values: FollowingFeedIndexUpdate[] = []

            if (reposts.length > 0) {
                const repostsData = await this.ctx.kysely
                    .selectFrom("Record")
                    .innerJoin("User", "User.did", "Record.authorId")
                    .innerJoin("Reaction", "Reaction.uri", "Record.uri")
                    .innerJoin("Record as RepostedRecord", "Reaction.subjectId", "RepostedRecord.uri")
                    .leftJoin("Content as RepostedRecordContent", "RepostedRecordContent.uri", "RepostedRecord.uri")
                    .leftJoin("Post", "Post.uri", "RepostedRecord.uri")
                    .where("Record.uri", "in", reposts)
                    .select([
                        "Record.uri",
                        "Record.collection",
                        "Record.created_at_tz as created_at",
                        "RepostedRecord.uri as repostedContentId",
                        "User.inCA",
                        "Post.rootId"
                    ])
                    .execute()

                followers.forEach(f => {
                    repostsData.forEach(r => {
                        if (r.created_at) {
                            values.push({
                                contentId: r.uri,
                                repostedContentId: r.repostedContentId,
                                readerId: getDidFromUri(f.uri),
                                collection: getCollectionEnumFromUri(r.repostedContentId),
                                authorInCA: r.inCA,
                                created_at: r.created_at,
                                rootId: r.rootId ?? r.repostedContentId,
                                authorId: getDidFromUri(r.uri)
                            })
                        }
                    })
                })
            }

            if (records.length > 0) {
                const recordsData = await this.ctx.kysely
                    .selectFrom("Record")
                    .innerJoin("User", "User.did", "Record.authorId")
                    .leftJoin("Post", "Post.uri", "Record.uri")
                    .where("Record.uri", "in", records)
                    .select([
                        "Record.uri",
                        "Record.collection",
                        "Record.created_at_tz as created_at",
                        "User.inCA",
                        "Post.rootId"
                    ])
                    .execute()

                const readers = followers.map(f => getDidFromUri(f.uri))

                const follows = await this.ctx.kysely
                    .selectFrom("Follow")
                    .innerJoin("Record", "Record.uri", "Follow.uri")
                    .where("Record.authorId", "in", readers)
                    .select(["Follow.uri", "Follow.userFollowedId"])
                    .execute()

                const followsSet = new Set<string>(follows.map(f => {
                    return `${f.userFollowedId}:${getDidFromUri(f.uri)}`
                }))

                followers.forEach(f => {
                    recordsData.forEach(r => {
                        if (r.created_at) {
                            const readerId = getDidFromUri(f.uri)
                            if (!r.rootId || followsSet.has(`${getDidFromUri(r.rootId)}:${readerId}`)) {
                                values.push({
                                    contentId: r.uri,
                                    repostedContentId: null,
                                    readerId,
                                    collection: getCollectionEnumFromUri(r.uri),
                                    authorInCA: r.inCA,
                                    created_at: r.created_at,
                                    rootId: r.rootId ?? r.uri,
                                    authorId: getDidFromUri(r.uri)
                                })
                            }
                        }
                    })
                })
            }

            if(values.length > 0) {
                await trx
                    .insertInto("FollowingFeedIndex")
                    .values(values)
                    .onConflict((oc) => oc.columns(["readerId", "contentId"]).doNothing())
                    .execute()
            }

            await this.keepLatestWithRoot(trx)
        })
    }

    async keepLatestWithRoot(trx: Transaction<DB>) {
        await trx
            .deleteFrom("FollowingFeedIndex as A")
            .where(eb => eb.exists(eb.selectFrom("FollowingFeedIndex as B")
                .whereRef("A.rootId", "=", "B.rootId")
                .whereRef("B.created_at", ">", "A.created_at")
                .whereRef("A.readerId", "=", "B.readerId")
            ))
            .execute()
    }
}
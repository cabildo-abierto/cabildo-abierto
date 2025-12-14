import {AppContext} from "#/setup.js";
import {
    getCollectionEnumFromUri,
    getCollectionFromUri,
    getDidFromUri,
    isArticle, isPost,
    isRepost
} from "@cabildo-abierto/utils";
import {CollectionEnum} from "@cabildo-abierto/api";


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

        if (updates.length > 0) {
            const bs = 5000
            for (let i = 0; i < updates.length; i += bs) {
                this.ctx.logger.pino.info({i}, "batch")
                await this.ctx.kysely.transaction().execute(async trx => {
                    await trx
                        .insertInto("FollowingFeedIndex")
                        .values(updates.slice(i, i + bs))
                        .onConflict((oc) => oc.columns(["readerId", "contentId"]).doNothing())
                        .execute()

                    // await this.keepLatestWithRoot(trx)
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
        if (data.length == 0) return
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

    async getUpdatesFromRepostUris(uris: string[]): Promise<FollowingFeedIndexUpdate[]> {
        if (uris.length == 0) return []
        const repostsData = await this.ctx.kysely
            .selectFrom("Record")
            .innerJoin("User", "User.did", "Record.authorId")
            .innerJoin("Reaction", "Reaction.uri", "Record.uri")
            .innerJoin("Record as RepostedRecord", "Reaction.subjectId", "RepostedRecord.uri")
            .leftJoin("Content as RepostedRecordContent", "RepostedRecordContent.uri", "RepostedRecord.uri")
            .leftJoin("Post", "Post.uri", "RepostedRecord.uri")
            .where("Record.uri", "in", uris)
            .leftJoin("Follow", "Follow.userFollowedId", "Record.authorId")
            .leftJoin("Record as FollowRecord", "FollowRecord.uri", "Follow.uri")
            .leftJoin("User as FollowUser", "FollowUser.did", "FollowRecord.authorId")
            .where(eb => eb.or([
                eb("FollowUser.inCA", "=", true),
                eb("Follow.uri", "is", null)
            ]))
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "RepostedRecord.uri as repostedContentId",
                "User.inCA",
                "Post.rootId",
                "Follow.uri as followUri"
            ])
            .execute()

        const result: FollowingFeedIndexUpdate[] = repostsData.map(r => {
            if (r.created_at && r.followUri) {
                return {
                    contentId: r.uri,
                    repostedContentId: r.repostedContentId,
                    readerId: getDidFromUri(r.followUri),
                    collection: getCollectionEnumFromUri(r.repostedContentId),
                    authorInCA: r.inCA,
                    created_at: r.created_at,
                    rootId: r.rootId ?? r.repostedContentId,
                    authorId: getDidFromUri(r.uri)
                }
            }
        }).filter(x => x != null)

        // agregamos también los reposts al following feed del autor
        uris.forEach(uri => {
            const r = repostsData.find(r => r.uri === uri)
            if(r && r.created_at) {
                result.push({
                    contentId: r.uri,
                    repostedContentId: r.repostedContentId,
                    readerId: getDidFromUri(r.uri),
                    collection: getCollectionEnumFromUri(r.repostedContentId),
                    authorInCA: r.inCA,
                    created_at: r.created_at,
                    rootId: r.rootId ?? r.repostedContentId,
                    authorId: getDidFromUri(r.uri)
                })
            }
        })
        return result
    }

    async getUpdatesFromPostUris(uris: string[]): Promise<FollowingFeedIndexUpdate[]> {
        if (uris.length == 0) return []

        const postsData = await this.ctx.kysely
            .selectFrom("Post")
            .where("Post.uri", "in", uris)
            .innerJoin("Record", "Record.uri", "Post.uri")
            .innerJoin("User", "User.did", "Record.authorId")
            .innerJoin("Content", "Content.uri", "Post.uri")
            .leftJoin("Follow", "Follow.userFollowedId", "Record.authorId")
            .leftJoin("Record as FollowRecord", "FollowRecord.uri", "Follow.uri")
            .leftJoin("User as FollowUser", "FollowUser.did", "FollowRecord.authorId")
            .where(eb => eb.or([
                eb("FollowUser.inCA", "=", true),
                eb("Follow.uri", "is", null)
            ]))
            .leftJoin("Record as RootRecord", "RootRecord.uri", "Post.rootId")
            .where(eb => eb.or([
                eb("Post.rootId", "is", null),
                eb("RootRecord.authorId", "=", eb.ref("Record.authorId")),
                eb.exists(eb // solo lo agregamos si el lector también sigue al autor de la raíz
                    .selectFrom("Follow as Follow2")
                    .innerJoin("Record as FollowRecord2", "FollowRecord2.uri", "Follow2.uri")
                    .whereRef("FollowRecord.authorId", "=", "FollowRecord2.authorId")
                    .whereRef("Follow2.userFollowedId", "=", "RootRecord.authorId")
                ),
            ]))
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "User.inCA",
                "Post.rootId",
                "Follow.uri as followUri",
                "RootRecord.uri as rootUri"
            ])
            .execute()

        const result = postsData.map(r => {
            if (r.created_at && r.followUri) {
                return {
                    contentId: r.uri,
                    readerId: getDidFromUri(r.followUri),
                    collection: getCollectionEnumFromUri(r.uri),
                    authorInCA: r.inCA,
                    created_at: r.created_at,
                    rootId: r.rootUri ?? r.uri,
                    authorId: getDidFromUri(r.uri),
                    repostedContentId: null,
                }
            }
        }).filter(x => x != null)

        uris.forEach(uri => {
            const r = postsData.find(r => r.uri === uri)
            if(r && r.created_at) {
                result.push({
                    contentId: r.uri,
                    readerId: getDidFromUri(r.uri),
                    collection: getCollectionEnumFromUri(r.uri),
                    authorInCA: r.inCA,
                    created_at: r.created_at,
                    rootId: r.rootUri ?? r.uri,
                    authorId: getDidFromUri(r.uri),
                    repostedContentId: null,
                })
            }
        })

        return result
    }

    async getUpdatesFromArticleUris(uris: string[]): Promise<FollowingFeedIndexUpdate[]> {
        if (uris.length == 0) return []
        const articlesData = await this.ctx.kysely
            .selectFrom("Article")
            .innerJoin("Record", "Record.uri", "Article.uri")
            .innerJoin("User", "User.did", "Record.authorId")
            .leftJoin("Content", "Content.uri", "Article.uri")
            .where("Article.uri", "in", uris)
            .innerJoin("Follow", "Follow.userFollowedId", "Record.authorId")
            .leftJoin("Record as FollowRecord", "FollowRecord.uri", "Follow.uri")
            .leftJoin("User as FollowUser", "FollowUser.did", "FollowRecord.authorId")
            .where(eb => eb.or([
                eb("FollowUser.inCA", "=", true),
                eb("Follow.uri", "is", null)
            ]))
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "User.inCA",
                "Follow.uri as followUri"
            ])
            .execute()

        const result: FollowingFeedIndexUpdate[] = articlesData.map(r => {
            if (r.created_at) {
                return {
                    contentId: r.uri,
                    readerId: getDidFromUri(r.followUri),
                    collection: getCollectionEnumFromUri(r.uri),
                    authorInCA: r.inCA,
                    created_at: r.created_at,
                    rootId: r.uri,
                    authorId: getDidFromUri(r.uri),
                    repostedContentId: null
                }
            }
        }).filter(x => x != null)

        uris.forEach(uri => {
            const r = articlesData.find(r => r.uri == uri)
            if(r && r.created_at) {
                result.push({
                    contentId: r.uri,
                    readerId: getDidFromUri(r.uri),
                    collection: getCollectionEnumFromUri(r.uri),
                    authorInCA: r.inCA,
                    created_at: r.created_at,
                    rootId: r.uri,
                    authorId: getDidFromUri(r.uri),
                    repostedContentId: null
                })
            }
        })

        return result
    }

    async updateOnNewContents(uris: string[]) {
        if (uris.length == 0) return

        this.ctx.logger.pino.info({uris}, "starting following feed update on contents")

        const articles = uris.filter(u => isArticle(getCollectionFromUri(u)))
        const posts = uris.filter(u => isPost(getCollectionFromUri(u)))
        const reposts = uris.filter(u => isRepost(getCollectionFromUri(u)))

        const t1 = Date.now()
        const values = (await Promise.all([
            this.getUpdatesFromRepostUris(reposts),
            this.getUpdatesFromPostUris(posts),
            this.getUpdatesFromArticleUris(articles)
        ])).flat()
        const t2 = Date.now()

        if (values.length > 0) {
            await this.ctx.kysely.transaction().execute(async trx => {
                await trx
                    .insertInto("FollowingFeedIndex")
                    .values(values)
                    .onConflict((oc) => oc.columns(["readerId", "contentId"]).doNothing())
                    .execute()
                // await this.keepLatestWithRoot(trx, unique(values.map(v => v.readerId)))
            })
        }
        const t3 = Date.now()
        this.ctx.logger.logTimes("keep latest with root", [t1, t2, t3])
    }

    /*async keepLatestWithRoot(trx: Transaction<DB>, readersId?: string[]) {
        await trx
            .deleteFrom("FollowingFeedIndex as A")
            .where(eb => eb.exists(eb.selectFrom("FollowingFeedIndex as B")
                .whereRef("A.rootId", "=", "B.rootId")
                .whereRef("B.created_at", ">", "A.created_at")
                .whereRef("A.readerId", "=", "B.readerId")
                .$if(readersId != null, qb => qb.where("B.readerId", "in", readersId!))
            ))
            .$if(readersId != null, qb => qb.where("A.readerId", "in", readersId!))
            .execute()
    }*/
}
import {AppContext} from "#/setup.js";
import {getCollectionEnumFromUri, getDidFromUri} from "@cabildo-abierto/utils";
import {CollectionEnum} from "@cabildo-abierto/api";


type FollowingFeedIndexUpdate = {
    contentId: string
    repostedContentId: string | null
    readerId: string
    collection: CollectionEnum
    authorInCA: boolean
    created_at: Date
}


/*
    Idea:
     - Por cada post, para cada uno de los seguidores actualizamos el feed de la siguiente manera.
     - Si es un root, se inserta.
     - Si no, se mira el root. Si el autor es seguido por el usuario:
        - Si no existe: se inserta.
        - Si existe lo reemplazamos.
 */

export class FeedIndexPopulator {
    ctx: AppContext
    constructor(ctx: AppContext) {
        this.ctx = ctx
    }

    async getUpdatesFromRecords(followersMap: Map<string, Set<string>>, since: Date) {
        const records = await this.ctx.kysely
            .selectFrom("Record")
            .innerJoin("User", "User.did", "Record.authorId")
            .leftJoin("Post", "Post.uri", "Record.uri")
            .where("Record.created_at_tz", ">", since)
            .where("Post.replyToId", "is", null) // por ahora
            .where("User.inCA", "=", true) // por ahora
            .where("Record.collection", "in", [
                "app.bsky.feed.post",
                "ar.cabildoabierto.feed.article"
            ])
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "User.inCA"
            ])
            .execute()

        const values: FollowingFeedIndexUpdate[] = []
        records.forEach(r => {
            const followers = followersMap.get(getDidFromUri(r.uri))
            if(followers) {
                followers.forEach(f => {
                    if(r.created_at) {
                        values.push({
                            contentId: r.uri,
                            repostedContentId: null,
                            readerId: f,
                            collection: getCollectionEnumFromUri(r.uri),
                            authorInCA: r.inCA,
                            created_at: r.created_at
                        })
                    }
                })
            }
        })
        return values
    }

    async getUpdatesFromReposts(followersMap: Map<string, Set<string>>, since: Date) {
        const reposts = await this.ctx.kysely
            .selectFrom("Record")
            .innerJoin("User", "User.did", "Record.authorId")
            .innerJoin("Reaction", "Reaction.uri", "Record.uri")
            .innerJoin("Record as RepostedRecord", "Reaction.subjectId", "RepostedRecord.uri")
            .leftJoin("Content as RepostedRecordContent", "RepostedRecordContent.uri", "RepostedRecord.uri")
            .where("Record.created_at_tz", ">", since)
            .where("User.inCA", "=", true) // por ahora
            .where("Record.collection", "=", "app.bsky.feed.repost")
            .where("RepostedRecordContent.uri", "is not", null)
            .select([
                "Record.uri",
                "Record.collection",
                "Record.created_at_tz as created_at",
                "RepostedRecord.uri as repostedContentId",
                "User.inCA"
            ])
            .execute()

        const values: FollowingFeedIndexUpdate[] = []
        reposts.forEach(r => {
            const followers = followersMap.get(getDidFromUri(r.uri))
            if(followers) {
                followers.forEach(f => {
                    if(r.created_at) {
                        values.push({
                            contentId: r.uri,
                            repostedContentId: r.repostedContentId,
                            readerId: f,
                            collection: getCollectionEnumFromUri(r.repostedContentId),
                            authorInCA: r.inCA,
                            created_at: r.created_at
                        })
                    }
                })
            }
        })
        return values
    }

    async populate(dids: string[], since: Date) {
        const followersMap = await this.getFollowersMap( dids)

        const recordUpdates = await this.getUpdatesFromRecords(followersMap, since)
        const repostUpdates = await this.getUpdatesFromReposts(followersMap, since)
        const updates = [...recordUpdates, ...repostUpdates]

        this.ctx.logger.pino.info({count: updates.length}, "inserting following feed entries")

        if(updates.length > 0) {
            const bs = 5000
            for(let i = 0; i < updates.length; i += bs) {
                await this.ctx.kysely
                    .insertInto("FollowingFeedIndex")
                    .values(updates.slice(i, i+bs))
                    .onConflict((oc) => oc.columns(["readerId", "contentId"]).doNothing())
                    .execute()
            }
        }

        this.ctx.logger.pino.info("following feed index populated")
    }

    async getFollowersMap(dids: string[]) {
        const follows = (await this.ctx.kysely
            .selectFrom("Follow")
            .innerJoin("Record", "Record.uri", "Follow.uri")
            .where("Record.authorId", "in", dids)
            .select(["Follow.userFollowedId", "Record.authorId"])
            .execute()).filter(x => x != null)

        const followersMap = new Map<string, Set<string>>()
        follows.forEach(r => {
            if(!r.userFollowedId || !r.authorId) return
            const cur = followersMap.get(r.userFollowedId)
            if(cur) {
                cur.add(r.authorId)
            } else {
                followersMap.set(r.userFollowedId, new Set([r.authorId]))
            }
        })

        return followersMap
    }
}
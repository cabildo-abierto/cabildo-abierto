import {AppContext} from "#/setup.js";
import { sql } from "kysely";
import {Effect} from "effect";
import {DBInsertError, DBSelectError} from "#/utils/errors.js";


export const updateInteractionsScore = (
    ctx: AppContext,
    uris?: string[]
) => Effect.gen(function* () {
    if(uris && uris.length == 0) return
    const batchSize = 500
    let offset = 0
    const lastMonth = new Date(Date.now() - 1000*3600*24*30)
    while(true){
        let batchUris: string[] | null = null
        if(uris != null){
            batchUris = uris.slice(offset, offset+batchSize)
        }

        const scores: {uri: string, likesScore: number, interactionsScore: number}[] = yield* Effect.tryPromise({
            try: () => ctx.kysely
                .selectFrom("Content")
                .innerJoin("Record", "Record.uri", "Content.uri")
                .where("Record.created_at_tz", ">", lastMonth)
                .$if(batchUris != null, qb => qb.where("Content.uri", "in", batchUris))
                .$if(batchUris == null, qb => qb.limit(batchSize).offset(offset))
                .select(eb => [
                    "Content.uri",
                    eb(
                        "Record.uniqueLikesCount",
                        "-",
                        eb.case()
                            .when(
                                eb.exists(eb.selectFrom('Reaction')
                                    .leftJoin('Record as ReactionRecord', 'Reaction.uri', 'ReactionRecord.uri')
                                    .whereRef("Reaction.subjectId", "=", "Record.uri")
                                    .where('ReactionRecord.collection', '=', 'app.bsky.feed.like')
                                    .whereRef('ReactionRecord.authorId', '=', 'Record.authorId'))
                            )
                            .then(1).else(0)
                            .end()
                    ).as("likesScore"),
                    sql<number>`"Record"."uniqueLikesCount" + 
                    "Record"."uniqueRepostsCount" +
                    (select count("Post"."uri") as "count" from "Post"
                    inner join "Record" as "ReplyRecord" on "Post"."uri" = "ReplyRecord"."uri"
                    where 
                        "Post"."replyToId" = "Record"."uri" and
                        "ReplyRecord"."authorId" != "Record"."authorId"
                    )
                    - (
                        case when exists (
                            select * from "Reaction"
                            inner join "Record" as "ReactionRecord" on 
                                "Reaction"."uri" = "ReactionRecord"."uri"
                            where
                                "ReactionRecord"."collection" = 'app.bsky.feed.repost'
                                 and "ReactionRecord"."authorId" = "Record"."authorId"
                                 and "Reaction"."subjectId" = "Record"."uri"
                        ) then 1 else 0 end
                    )
                    - (
                        case when exists (
                            select * from "Reaction"
                            inner join "Record" as "ReactionRecord" on 
                                "Reaction"."uri" = "ReactionRecord"."uri"
                            where
                                "ReactionRecord"."collection" = 'app.bsky.feed.like'
                                 and "ReactionRecord"."authorId" = "Record"."authorId"  
                                 and "Reaction"."subjectId" = "Record"."uri"  
                        ) then 1 else 0 end
                    )
                    `.as("interactionsScore"),
                    sql<number>`
                    ("Record"."uniqueLikesCount" + 
                    "Record"."uniqueRepostsCount" +
                    (select count("Post"."uri") as "count" from "Post"
                    inner join "Record" as "ReplyRecord" on "Post"."uri" = "ReplyRecord"."uri"
                    where 
                        "Post"."replyToId" = "Record"."uri" and
                        "ReplyRecord"."authorId" != "Record"."authorId"
                    )
                    - (
                        case when exists (
                            select * from "Reaction"
                            inner join "Record" as "ReactionRecord" on 
                                    "Reaction"."uri" = "ReactionRecord"."uri"
                            where
                                "ReactionRecord"."collection" = 'app.bsky.feed.repost'
                                 and "ReactionRecord"."authorId" = "Record"."authorId"
                                 and "Reaction"."subjectId" = "Record"."uri"  
                        ) then 1 else 0 end
                    )
                    - (
                        case when exists (
                            select * from "Reaction"
                            inner join "Record" as "ReactionRecord" on 
                                "Reaction"."uri" = "ReactionRecord"."uri"
                            where
                                "ReactionRecord"."collection" = 'app.bsky.feed.like'
                                 and "ReactionRecord"."authorId" = "Record"."authorId"
                                 and "Reaction"."subjectId" = "Record"."uri"    
                        ) then 1 else 0 end
                    ))::numeric / sqrt(1 + (
                        select count(distinct "Follower"."did") from "User" as "Follower"
                        where "Follower"."inCA" = true
                        and exists (select * from "Follow" inner join "Record" as "FollowRecord" on "FollowRecord"."uri" = "Follow"."uri"
                        where "Follow"."userFollowedId" = "Follower"."did")
                    ))
                `.as("relativePopularityScore")
                ])
                .execute(),
            catch: (error) => new DBSelectError(error)
        })

        if(scores.length > 0){
            yield* Effect.tryPromise({
                try: () => ctx.kysely
                    .insertInto("Content")
                    .values(scores.map(s => ({
                        ...s,
                        embeds: [],
                        selfLabels: []
                    })))
                    .onConflict(oc => oc.column("uri").doUpdateSet(eb => ({
                        likesScore: eb.ref("excluded.likesScore"),
                        interactionsScore: eb.ref("excluded.interactionsScore"),
                        relativePopularityScore: eb.ref("excluded.relativePopularityScore")
                    })))
                    .execute(),
                catch: (error) => new DBInsertError(error)
            })
        }

        offset += batchSize
        if(scores.length < batchSize) break
    }
}).pipe(Effect.withSpan("updateInteractionsScore", {attributes: {count: uris?.length ?? -1}}))
import {FollowSuggestionsOutput} from "@cabildo-abierto/api"
import {DataPlane, makeDataPlane} from "#/services/hydration/dataplane.js";
import {CAHandler, EffHandler} from "#/utils/handler.js";
import {hydrateProfileView} from "#/services/hydration/profile.js";
import {sql} from "kysely";
import {AppContext} from "#/setup.js";
import {v4 as uuidv4} from 'uuid'
import {getCAUsersDids} from "#/services/user/users.js";
import {Effect} from "effect";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";
import {DBSelectError} from "#/utils/errors.js";

/*
    1. Tomamos un conjunto de usuarios recomendadores. Los recomendadores son los seguidos del usuario o, si tiene muy pocos, todos los usuarios de CA.
    2. Tomamos a las 200 personas más seguidas entre los recomendadores
    3. Las ordenamos según:
     Porcentaje de recomendadores que siguen +
     Si está o no está en CA * 0.25 +
     Si escribió o no algún artículo * 0.25 +
     Si publicó al menos un post en las últimas dos semanas * 0.25
*/


const getRecommendationRankingForUser = (
    ctx: AppContext,
    did: string,
    ignoreCache: boolean = false
): Effect.Effect<string[], RedisCacheFetchError | RedisCacheSetError | DBSelectError> => Effect.gen(function* () {
    if(!ignoreCache){
        const inCache = yield* Effect.tryPromise({
            try: () => ctx.redisCache.followSuggestions.get(did),
            catch: () => new RedisCacheFetchError()
        })
        if(inCache != null) return inCache
    }

    const lastTwoWeeks = new Date(Date.now() - 1000*3600*24*14)
    const recommendations = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .with("Follows", db => db
                .selectFrom("Follow")
                .innerJoin("Record", "Record.uri", "Follow.uri")
                .where("Record.authorId", "=", did)
                .select(["Follow.userFollowedId"])
            )
            .with("Recommenders", db =>
                db.selectFrom("Follows")
                    .select("userFollowedId as did")
                    .where( // si los follows del usuario son más de 3, los recommenders son las cuentas a las que sigue
                        eb => eb(
                            eb => eb.selectFrom("Follows").select(eb => eb.fn.count<number>("userFollowedId").as("count")),
                            ">=",
                            3
                        )
                    )
                    .innerJoin("User as FollowedUser", "FollowedUser.did", "Follows.userFollowedId")
                    .where("FollowedUser.inCA", "=", true)
                    .unionAll(
                        db.selectFrom("User")
                            .where( // si el usuario sigue a menos de 3 personas, los recommenders son todos los usuarios de CA
                                eb => eb(
                                    eb => eb.selectFrom("Follows").select(eb => eb.fn.count<number>("userFollowedId").as("count")),
                                    "<",
                                    3
                                )
                            )
                            .where("inCA", "=", true)
                            .select("did")
                    )
                    .limit(1000)
            )
            .selectFrom("User as Candidate") // los candidatos son todas las personas seguidas por algun seguido de agent.did
            .innerJoin("Follow as Recommendation", "Recommendation.userFollowedId", "Candidate.did")
            .innerJoin("Record as RecommendationRecord", "RecommendationRecord.uri", "Recommendation.uri")
            .innerJoin("Recommenders", "Recommenders.did", "RecommendationRecord.authorId")

            // no es seguido por el usuario logueado
            .leftJoin("Follows", "Follows.userFollowedId", "Candidate.did")
            .where("Follows.userFollowedId", "is", null)

            // no es el usuario logueado
            .where("Candidate.did", "!=", did)

            // no está marcado como not interested
            .where(eb =>
                eb.not(
                    eb.exists(
                        eb.selectFrom("NotInterested")
                            .select("id")
                            .whereRef("NotInterested.subjectId", "=", "Candidate.did")
                            .where("NotInterested.authorId", "=", did)
                    )
                )
            )

            .select([
                "Candidate.did",
                sql<number>`(count("Candidate"."did")::float / (select count(*) from "Recommenders")) + CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM "Record" 
                        WHERE "Record"."authorId" = "Candidate"."did" 
                        AND "Record"."createdAt" > ${lastTwoWeeks}
                    AND "Record"."collection" = 'ar.cabildoabierto.feed.article'
                    ) THEN 0.25 ELSE 0 END + CASE WHEN EXISTS (
                        SELECT 1 FROM "Record" 
                        WHERE "Record"."authorId" = "Candidate"."did" 
                        AND "Record"."createdAt" > ${lastTwoWeeks}
                    ) THEN 0.25 ELSE 0 END + CASE WHEN "Candidate"."inCA" THEN 0.25 ELSE 0 END
                `.as("score")
            ])
            .groupBy(["Candidate.did"])
            .orderBy(["score desc", "Candidate.did asc"])
            .limit(300)
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    const dids = recommendations.map(r => r.did)

    yield* Effect.tryPromise({
        try: () => ctx.redisCache.followSuggestions.set(did, dids),
        catch: (error) => new DBSelectError(error)
    })
    return dids
}).pipe(Effect.withSpan("getRecommendationRankingForUser"))


export const getFollowSuggestionsToAvoid = (
    ctx: AppContext,
    did: string
) => Effect.gen(function* () {
    const data = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("NotInterested")
            .select("subjectId as did")
            .where("authorId", "=", did)
            .unionAll(eb => eb
                .selectFrom("Follow")
                .innerJoin("User", "User.did", "Follow.userFollowedId")
                .innerJoin("Record", "Record.uri", "Follow.uri")
                .where("Record.authorId", "=", did)
                .select("User.did")
            )
            .execute(),
        catch: (error) => new DBSelectError(error)
    })

    return new Set((data).map(x => x.did))
}).pipe(Effect.withSpan("getFollowSuggestionsToAvoid"))


export const getFollowSuggestions: EffHandler<
    {params: {limit: string, cursor?: string}},
    FollowSuggestionsOutput
> = (ctx, agent, {params}) => Effect.provideServiceEffect(
    Effect.gen(function* () {
    const [ranking, avoid] = yield* Effect.all([
        getRecommendationRankingForUser(ctx, agent.did),
        getFollowSuggestionsToAvoid(ctx, agent.did)
    ], {concurrency: "unbounded"})

    const limit = parseInt(params.limit)
    const offset = params.cursor ? parseInt(params.cursor) : 0

    const dids: string[] = []

    let nextIndex = offset
    while(dids.length < limit && nextIndex < ranking.length){
        if(!avoid.has(ranking[nextIndex])){
            dids.push(ranking[nextIndex])
        }
        nextIndex++
    }

    yield* Effect.annotateCurrentSpan("dids", dids.length)

    const dataplane = yield* DataPlane
    yield* dataplane.fetchProfileViewHydrationData(dids)

    const profiles = (yield* Effect.all(dids
        .map(d => hydrateProfileView(ctx, d))))
        .filter(x => x != null)

    const cursor = nextIndex >= ranking.length ? undefined : nextIndex.toString()

    return {
        feed: profiles,
        cursor
    }
}).pipe(Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener las recomendaciones."))), DataPlane, makeDataPlane(ctx, agent))


export const setNotInterested: CAHandler<{params: {subject: string}}> = async (ctx, agent, {params}) => {
    await ctx.kysely
        .insertInto("NotInterested")
        .values([{
            id: uuidv4(),
            subjectId: params.subject,
            authorId: agent.did
        }])
        .execute()

    await ctx.redisCache.onEvent("follow-suggestions-dirty", [agent.did])

    return {data: {}}
}


export const updateFollowSuggestions = (ctx: AppContext): Effect.Effect<
    void,
    RedisCacheFetchError | RedisCacheSetError | DBSelectError
> => Effect.gen(function* () {
    let dids = yield* Effect.tryPromise({
        try: () => ctx.redisCache.followSuggestionsDirty.getDirty(),
        catch: () => new RedisCacheFetchError()
    })

    const caUsers = new Set(yield* getCAUsersDids(ctx))

    dids = dids.filter(d => caUsers.has(d))

    for(let i = 0; i < dids.length; i++) {
        const did = dids[i]
        yield* Effect.tryPromise({
            try: () => ctx.redisCache.onEvent("follow-suggestions-ready", [did]),
            catch: () => new RedisCacheSetError()
        })
        yield* getRecommendationRankingForUser(ctx, did, true)
    }
}).pipe(Effect.withSpan("updateFollowSuggestions"))
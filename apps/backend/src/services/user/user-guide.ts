import {EffHandler} from "#/utils/handler.js";
import {UserGuideGoal, UserGuideStatus} from "@cabildo-abierto/api";
import {Effect} from "effect";
import {DBSelectError} from "#/utils/errors.js";
import { count } from "@cabildo-abierto/utils";

export const getUserGuideStatus: EffHandler<{}, UserGuideStatus> = (
    ctx,
    agent
) => Effect.gen(function* () {
    const data = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("User")
            .select([
                "User.did",
                "displayName",
                "avatar",
                "banner",
                "description",
                (eb) =>
                    eb
                        .selectFrom("Record")
                        .whereRef("Record.authorId", "=", "User.did")
                        .innerJoin("Follow", "Follow.uri", "Record.uri")
                        .innerJoin("User as UserFollowed", "UserFollowed.did", "Follow.userFollowedId")
                        .where("UserFollowed.inCA", "=", true)
                        .select(eb.fn.countAll<number>().as("count"))
                        .as("followsCount"),
                (eb) =>
                    eb
                        .selectFrom("Record")
                        .innerJoin("Article", "Article.uri", "Record.uri")
                        .select(eb.fn.countAll<number>().as("count"))
                        .whereRef("Record.authorId", "=", "User.did")
                        .where("Record.collection", "=", "ar.cabildoabierto.feed.article")
                        .as("articlesCount"),
                (eb) =>
                    eb
                        .selectFrom("Record")
                        .innerJoin("TopicVersion", "TopicVersion.uri", "Record.uri")
                        .select(eb.fn.countAll<number>().as("count"))
                        .whereRef("Record.authorId", "=", "User.did")
                        .where("Record.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                        .as("editsCount"),
                (eb) =>
                    eb
                        .selectFrom("ReadSession")
                        .select(eb.fn.countAll<number>().as("count"))
                        .whereRef("ReadSession.userId", "=", "User.did")
                        .where("ReadSession.topicId", "is not", null)
                        .as("readTopicsCount"),
                (eb) =>
                    eb
                        .selectFrom("Record")
                        .innerJoin("Post", "Post.uri", "Record.uri")
                        .innerJoin("Record as ParentRecord", "ParentRecord.uri", "Post.replyToId")
                        .select(eb.fn.countAll<number>().as("count"))
                        .whereRef("Record.authorId", "=", "User.did")
                        .where("ParentRecord.collection", "=", "ar.cabildoabierto.wiki.topicVersion")
                        .as("commentsCount"),
                (eb) =>
                    eb
                        .selectFrom("PollVote")
                        .innerJoin("Record", "Record.uri", "PollVote.uri")
                        .select(eb.fn.countAll<number>().as("count"))
                        .whereRef("Record.authorId", "=", "User.did")
                        .as("pollVotesCount"),
                (eb) =>
                    eb
                        .selectFrom("Event")
                        .select(eb.fn.countAll<number>().as("count"))
                        .whereRef("Event.userId", "=", "User.did")
                        .where("Event.eventTypeId", "=", "visualization_save")
                        .as("visualizationSavesCount")

            ])
            .where("User.did", "=", agent.did)
            .executeTakeFirstOrThrow(),
        catch: (error) => new DBSelectError(error)
    })

    const profileProgress = count([
        data.avatar,
        data.description,
        data.displayName,
        data.banner
    ], x => x != null)


    const goals: UserGuideGoal[] = [
        {label: "Completá tu perfil", progress: profileProgress, objective: 4},
        {label: "Seguí a 10 personas", progress: data.followsCount ?? 0, objective: 10},
        {label: "Entrá a un tema", progress: data.readTopicsCount ?? 0, objective: 1},
        {label: "Editá un tema", progress: data.editsCount ?? 0, objective: 1},
        {label: "Escribí un articulo", progress: data.articlesCount ?? 0, objective: 1},
        {label: "Comentá en un tema", progress: data.commentsCount ?? 0, objective: 1},
        {label: "Votá en una encuesta", progress: data.pollVotesCount ?? 0, objective: 1},
        {label: "Creá o editá una visualización", progress: data.visualizationSavesCount ?? 0, objective: 1},
    ];

    return sortGoals(goals)
})
    .pipe(Effect.withSpan("getUserGuideStatus"))
    .pipe(Effect.catchTag("DBSelectError", () => Effect.fail("Ocurrió un error al obtener la guía de inicio.")))



function sortGoals(goals: UserGuideGoal[]) {
    return [...goals].sort((a, b) => {
        const aRatio = a.objective > 0 ? Math.min(a.progress / a.objective, 1) : 0
        const bRatio = b.objective > 0 ? Math.min(b.progress / b.objective, 1) : 0
        const aComplete = a.progress >= a.objective
        const bComplete = b.progress >= b.objective

        if (aComplete !== bComplete) {
            return aComplete ? 1 : -1
        }

        if (bRatio !== aRatio) {
            return bRatio - aRatio
        }

        return a.label.localeCompare(b.label)
    })
}
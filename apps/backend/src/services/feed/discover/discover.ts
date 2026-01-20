import {FeedPipelineProps, GetSkeletonProps} from "#/services/feed/feed.js";
import {min} from "@cabildo-abierto/utils";

const getDiscoverFeedSkeleton: GetSkeletonProps = async (ctx, agent, data, cursor) => {
    if (!agent.hasSession()) {
        throw Error("Sin sesión")
    }

    const interests = await ctx.kysely
        .selectFrom("UserInterest")
        .select(["UserInterest.topicCategoryId as id"])
        .where("UserInterest.userId", "=", agent.did)
        .execute()

    if(interests.length == 0) {
        return {
            skeleton: [],
            cursor: undefined
        }
    }

    let dateSince = new Date()
    let firstFetchDate = new Date()
    if (cursor) {
        const s = cursor.split("::")
        if (s.length == 2) {
            dateSince = new Date(s[1])
            firstFetchDate = new Date(s[0])
        } else {
            throw Error("Cursor inválido")
        }
    }


    const t1 = Date.now()
    const skeleton = await ctx.kysely
        .selectFrom("DiscoverFeedIndex")
        .innerJoin("Content", "Content.uri", "DiscoverFeedIndex.contentId")
        .where("Content.caModeration", "=", "Ok")
        .select(["DiscoverFeedIndex.contentId", "DiscoverFeedIndex.created_at"])
        .where("DiscoverFeedIndex.created_at", "<", firstFetchDate)
        .where("DiscoverFeedIndex.created_at", "<", dateSince)
        .where("DiscoverFeedIndex.categoryId", "in", interests.map(i => i.id))
        .orderBy("DiscoverFeedIndex.created_at", "desc")
        .distinct()
        .limit(25)
        .execute()

    const t2 = Date.now()

    ctx.logger.logTimes("discover feed skeleton", [t1, t2])

    const newDateSince = min(skeleton, x => x.created_at?.getTime() ?? 0)?.created_at

    const newCursor = newDateSince ? [
        newDateSince.toISOString(),
        firstFetchDate.toISOString()
    ].join("::") : undefined

    return {
        skeleton: skeleton.map(u => ({post: u.contentId})),
        cursor: newCursor
    }
}

/*
.innerJoin("Content", "Content.uri", "Record.uri")
        .where(eb => eb
            .exists(eb
                .selectFrom("ContentToCategory")
                .whereRef("ContentToCategory.contentId", "=", "Content.uri")
                .where("ContentToCategory.categoryId", "in", interests.map(i => i.id))
            )
        )
 */
/*.where(eb => eb.exists(
    eb.selectFrom("Reference").whereRef('referencingContentId', '=', 'Record.uri')
        .innerJoin('Topic', 'Topic.id', 'Reference.referencedTopicId')
        .innerJoin("TopicVersion", "Topic.currentVersionId", "TopicVersion.uri")
        .where(eb => eb.or(interests.map(i => stringListIncludes("Categorías", i.id))))
))*/

export const discoverFeedPipeline: FeedPipelineProps = {
    getSkeleton: getDiscoverFeedSkeleton,
    sortKey: (a) => [0],
    debugName: "discover"
}

/* FEED CON TODOS LOS POSTS/ARTICULOS QUE CITAN ALGÚN TEMA, PARA INSPIRARSE EN QUÉ TEMAS FALTA DEFINIR
const temasDeCategorias = await ctx.kysely.selectFrom("Record")
        .select(["uri"])
        .innerJoin("User", "User.did", "Record.authorId")
        .where("User.inCA", "=", true)
        .where("Record.collection", "in", ['app.bsky.feed.post', 'ar.cabildoabierto.feed.article'])
        .where(eb => eb.exists(
            eb.selectFrom("Reference").whereRef('referencingContentId','=', 'Record.uri')
        ))
        .orderBy("Record.created_at", "desc")
        .limit(25)
        .execute()
*/
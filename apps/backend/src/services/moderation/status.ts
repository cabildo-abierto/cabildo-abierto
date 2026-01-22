import {CAHandler} from "#/utils/handler.js";
import {PendingModeration} from "@cabildo-abierto/api";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateFeedViewContent} from "#/services/hydration/hydrate.js";


export const getPendingModeration: CAHandler<{}, PendingModeration> = async (ctx, agent, {}) => {

    const records = await ctx.kysely
        .selectFrom("RecordModerationProcess")
        .select(["recordId", "id"])
        .where("result", "is", null)
        .orderBy("created_at asc")
        .limit(25)
        .execute()

    const data = new Dataplane(ctx, agent)

    const skeleton = records
        .map(r => r.recordId ? {post: r.recordId} : null)
        .filter(x => x != null)
    await data.fetchFeedHydrationData(skeleton)
    const hydrated = records.map(e => e.recordId ? hydrateFeedViewContent(ctx, {post: e.recordId}, data) : null)

    const contents = records.map((r, i) => {
        return {
            view: hydrated[i],
            uri: r.recordId,
            id: r.id
        }
    })

    return {
        data: {
            contents
        }
    }
}
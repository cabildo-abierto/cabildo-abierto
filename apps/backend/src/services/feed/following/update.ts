import {AppContext} from "#/setup.js";
import {FeedIndexUpdater} from "#/services/feed/following/populate.js";
import {getCAUsersDids} from "#/services/user/users.js";


export async function updateFollowingFeedOnFollowChange(ctx: AppContext, data: {follower: string, followed: string}[]) {
    await new FeedIndexUpdater(ctx).updateOnFollowChange(data)
}

export async function updateFollowingFeedOnNewContent(ctx: AppContext, uris: string[]) {
    await new FeedIndexUpdater(ctx).updateOnNewContents(uris)
}


export async function updateFollowingFeedOnContentDelete(ctx: AppContext, rootUris: string[]) {
    await updateFollowingFeedOnNewContent(ctx, rootUris)
}


export const updateAllFollowingFeeds = async (ctx: AppContext) => {
    const lastTwoMonths = new Date(Date.now() - 2*30*24*60*60*1000)
    const dids = await getCAUsersDids(ctx)
    await new FeedIndexUpdater(ctx).populate(dids, lastTwoMonths)
}


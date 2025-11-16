import {CAHandler} from "#/utils/handler.js";


export const findUsersInFollows: CAHandler<{params: {handle: string}}, {}> = async (ctx, agent, {params}) => {
    const handle = params.handle

    const users = await ctx.kysely
        .selectFrom("Follow")
        .innerJoin("Record", "Record.uri", "Follow.uri")
        .innerJoin("User", "Record.authorId", "User.did")
        .innerJoin(
            "User as FollowedUser", "FollowedUser.did", "Follow.userFollowedId")
        .where("User.handle", "=", handle)
        .where("FollowedUser.inCA", "=", false)
        .select([
            "FollowedUser.handle",
            "FollowedUser.did"
        ])
        .execute()

    const chatAgent = agent.bsky.withProxy("bsky_chat", "did:web:api.bsky.chat")

    ctx.logger.pino.info({handle, count: users.length}, "got follows")
    for(let i = 0; i < users.length; i++) {
        if(i % 20 == 0) {
            ctx.logger.pino.info({i, handle}, "at index")
        }
        const av = await chatAgent.chat.bsky.convo.getConvoAvailability({
            members: [users[i].did]
        })
        if(av.success && av.data.canChat) {
            const handle = await ctx.resolver.resolveDidToHandle(users[i].did, true)
            ctx.logger.pino.info({...users[i], handle}, "can chat")
        }
    }
    ctx.logger.pino.info({handle}, "done")
    return {data: {}}
}
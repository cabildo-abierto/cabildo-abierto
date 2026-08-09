import {CAHandlerNoAuth} from "#/utils/handler.js";


export type NextMeeting = {show: false} | {
    date: Date
    url: string
    show: true
    title: string
    description: string
}


export const getNextMeeting: CAHandlerNoAuth<{}, NextMeeting> = async (ctx, agent, {}) => {
    const cached = await ctx.redisCache.nextMeeting.get()
    if(cached) {
        return {data: cached}
    }

    const meetings = await ctx.kysely
        .selectFrom("Meeting")
        .select(["Meeting.date", "Meeting.title", "Meeting.description", "Meeting.url", "Meeting.show"])
        .where("Meeting.date", ">", new Date(Date.now()-1000*36000))
        .orderBy("Meeting.date", "desc")
        .limit(1)
        .execute()
    if(meetings && meetings.length > 0){
        const next = meetings[0]
        if(next.show){
            const data: NextMeeting = {
                show: true,
                date: next.date,
                title: next.title,
                description: next.description,
                url: next.url
            }
            await ctx.redisCache.nextMeeting.set(data)
            return {
                data
            }
        }
    }
    const data: NextMeeting = {show: false}
    await ctx.redisCache.nextMeeting.set(data)
    return {data}
}
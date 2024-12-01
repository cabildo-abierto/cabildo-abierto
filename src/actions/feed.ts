'use server'

import { db } from "../db";
import { FeedContentProps } from "../app/lib/definitions";
import { getSessionAgent } from "./auth";


export async function getATProtoFeed(): Promise<FeedContentProps[]>{
    const users = await db.user.findMany({
        select: {
            id: true
        }
    })

    const {agent} = await getSessionAgent()

    let posts = []

    for(let i = 0; i < users.length; i++){
        const {data} = await agent.getAuthorFeed({actor: users[i].id})
        data.feed.forEach((p) => {
            console.log(p.post)
            posts.push(p.post)
        })
    }

    return posts
}
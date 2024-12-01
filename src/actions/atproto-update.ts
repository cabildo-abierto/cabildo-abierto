'use server'
import { db } from "../db";
import { getSessionAgent } from "./auth";


export async function updatePosts(){
    const users = await db.user.findMany({
        select: {
            id: true
        }
    })

    const {agent} = await getSessionAgent()

    for(let i = 0; i < users.length; i++){
        console.log("actualizando usuario", users[i])
        const {data} = await agent.getAuthorFeed({actor: users[i].id})
        console.log("posts", data.feed)
        data.feed.forEach((p) => {
            console.log(p)
        })
    }
}
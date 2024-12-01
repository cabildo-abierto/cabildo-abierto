'use server'

import { db } from "../db";
import { FeedContentProps } from "../app/lib/definitions";
import { getSessionAgent } from "./auth";


export async function getATProtoFeed(): Promise<FeedContentProps[]>{
    const users = await db.user.findMany({
        select: {
            id: true,
            handle: true
        }
    })

    console.log("users", users)

    const {agent, did} = await getSessionAgent()

    let posts = []

    for(let i = 0; i < users.length; i++){
        console.log("user", users[i].id)
        let data
        try {
            const res = await agent.getAuthorFeed({actor: users[i].id})
            data = res.data
        } catch(err) {
            console.log("error getting author feed", users[i].id)
            console.log(err)
            continue
        }
        console.log("length", data.feed.length)
        data.feed.forEach((p) => {
            posts.push(p.post)
        })

        /*let articles
        try {
            const res = await agent.com.atproto.repo.listRecords({
                repo: users[i].id,
                collection: 'app.ca.article.post',
            })
            articles = res.data
        } catch(err) {
            console.log("Error getting articles for", users[i].id)
            console.log(err)
            continue
        }

        let author
        try {
            let res = await agent.getProfile({actor: users[i].id})
            author = res.data
        } catch(err) {
            console.log("Error al obtener el perfil", users[i].id)
            console.log(err)
            continue
        }

        posts = [...posts, ...articles.records.map(({value, ...record}) => {
            return {
                ...record,
                author,
                record: value,
                likeCount: 0,
                repostCount: 0,
                replyCount: 0,
                quoteCount: 0
            }
        })]*/
    }

    function cmp(a, b){
        return new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime()
    }

    return posts.sort(cmp)
}
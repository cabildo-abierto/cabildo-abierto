'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";

async function createUnclaimedUser({username}){
    await db.user.create({
    data: {
      username: username
    }
  })
}

export async function createComment(content, parentCommentId) {
    const author = await getUser()
    if(!author) return false

    const words = content.split(" ")

    let connections = []
    words.forEach(function(w){
        if(w.startsWith("@")){
            const relation = {
                username: w.slice(1)
            }
            connections.push({
                where: relation,
                create: relation
            })
        }
    })

    await db.comment.create({
        data: {
            content: content,
            authorId: author.id,
            parentCommentId: parentCommentId,
            mentions: {
                connectOrCreate: connections
            }
        },
    })

    return true
}
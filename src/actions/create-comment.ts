'use server'

import {db} from "@/db";
import {getUser} from "@/actions/get-user";

async function createUnclaimedUser(username: string){
    await db.user.create({
        data: {
        username: username
        }
    })
}


interface Connection {
    where: {
      username: string;
    };
    create: {
      username: string;
    };
}


function findReferences(text: string): Connection[]{
    return []

    // to do: reimlement this
    const words = text.split(" ")

    let connections: Connection[] = []
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
    return connections
}


export async function createComment(text: string, parentContentId: string) {
    const author = await getUser()
    if(!author) return false

    let connections = findReferences(text)

    await db.content.create({
        data: {
            text: JSON.stringify(text),
            authorId: author.id,
            parentContentId: parentContentId,
            mentionedUsers: {
                connectOrCreate: connections
            },
            type: "Comment"
        },
    })

    return true
}


export async function createOpinion(text: string, parentContentId: string) {
    const author = await getUser()
    if(!author) return false

    let connections = findReferences(text)

    await db.content.create({
        data: {
            text: JSON.stringify(text),
            authorId: author.id,
            parentContentId: parentContentId,
            mentionedUsers: {
                connectOrCreate: connections
            },
            type: "Opinion"
        },
    })

    return true
}



export async function createPost(text: string) {
    const author = await getUser()
    if(!author) return false

    let connections = findReferences(text)
    
    await db.content.create({
        data: {
            text: JSON.stringify(text),
            authorId: author.id,
            mentionedUsers: {
                connectOrCreate: connections
            },
            type: "Post"
        },
    })

    return true
}


export async function createDiscussion(text: string) {
    const author = await getUser()
    if(!author) return false

    let connections = findReferences(text)

    await db.content.create({
        data: {
            text: JSON.stringify(text),
            authorId: author.id,
            mentionedUsers: {
                connectOrCreate: connections
            },
            type: "Discussion"
        },
    })

    return true
}
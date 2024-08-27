'use server'

import {db} from "@/db";
import { ContentType } from "@prisma/client";
import { getUserId } from "./get-user";
import { revalidateTag } from "next/cache";
import { getEntities } from "./get-entity";


export async function createComment(text: string, parentContentId: string, userId?: string) {
    if(!userId){
        userId = await getUserId()
    }
    if(!userId) return null

    let references = await findReferences(text)

    const comment = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "Comment",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            }
        },
    })
    revalidateTag("contents")
    revalidateTag("users")
    revalidateTag("entities")
    revalidateTag("entity")
    return comment
}


export async function findReferences(text: string){

    function findReferencesInNode(node: any): {id: string}[] {
        let references: {id: string}[] = []
        if(node.type === "link"){
            if(node.url.startsWith("/articulo/")){
                const id = node.url.split("/articulo/")[1]
                references.push({id: id})
            }
        }
        if(node.children){
            for(let i = 0; i < node.children.length; i++) {
                const childRefs = findReferencesInNode(node.children[i])
                childRefs.forEach((x) => {references.push(x)})
            }
        }
        return references
    }

    const json  = JSON.parse(text)

    let references: {id: string}[] = findReferencesInNode(json.root)
    
    const entities = await getEntities()

    references = references.filter(({id}) => (entities.some((e) => (e.id == id))))

    return references
}


export async function createPost(text: string, postType: ContentType, isDraft: boolean, userId?: string, title?: string) {
    if(!userId){
        userId = await getUserId()
    }
    if(!userId) return null

    let references = await findReferences(text)

    const result = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: postType,
            isDraft: isDraft,
            title: title,
            entityReferences: {
                connect: references
            }
        },
    })

    revalidateTag("contents")
    revalidateTag("users")
    revalidateTag("entities")
    revalidateTag("entity")
    return result
}


export async function updateContent(text: string, contentId: string, title?: string) {

    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            title: title
        }
    })

    revalidateTag("contents")
    revalidateTag("users")
    return result
}


export async function publishDraft(text: string, contentId: string, title?: string) {

    let references = await findReferences(text)
    
    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            isDraft: false,
            createdAt: new Date(),
            title: title,
            entityReferences: {
                connect: references
            }
        }
    })
    revalidateTag("contents")
    revalidateTag("users")
    return result
}


export async function createFakeNewsReport(text: string, parentContentId: string, userId: string) {
    let references = await findReferences(text)

    const report = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "FakeNewsReport",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            }
        },
    })
    revalidateTag("contents")
    revalidateTag("users")
    revalidateTag("entities")
    revalidateTag("entity")
    return report
}
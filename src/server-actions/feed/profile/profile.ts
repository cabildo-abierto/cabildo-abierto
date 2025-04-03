"use server"
import {FeedContentProps} from "@/lib/definitions";
import {getMainProfileFeed} from "@/server-actions/feed/profile/main";
import {getRepliesProfileFeed} from "@/server-actions/feed/profile/replies";
import {getEditsProfileFeed} from "@/server-actions/feed/profile/edits";


export async function getProfileFeed(userId: string, kind: "main" | "replies" | "edits"): Promise<{error?: string, feed?: FeedContentProps[]}>{

    if(kind == "main"){
        return await getMainProfileFeed(userId)
    } else if(kind == "replies"){
        return await getRepliesProfileFeed(userId)
    } else if(kind == "edits"){
        return await getEditsProfileFeed(userId)
    } else {
        throw Error("Not implemented")
    }
}
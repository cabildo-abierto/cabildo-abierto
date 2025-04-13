"use server"
import {FeedContentProps} from "@/lib/definitions";
import {getMainProfileFeed} from "@/server-actions/feed/profile/main";
import {getRepliesProfileFeed} from "@/server-actions/feed/profile/replies";
import {getEditsProfileFeed} from "@/server-actions/feed/profile/edits";
import {getSessionAgent} from "@/server-actions/auth";
import {handleToDid} from "@/server-actions/user/users";


export async function getProfileFeed(userId: string, kind: "main" | "replies" | "edits"): Promise<{error?: string, feed?: FeedContentProps[]}>{

    const did = await handleToDid(userId)

    if(kind == "main"){
        return await getMainProfileFeed(did)
    } else if(kind == "replies"){
        return await getRepliesProfileFeed(did)
    } else if(kind == "edits"){
        return await getEditsProfileFeed(did)
    } else {
        throw Error("Not implemented")
    }
}
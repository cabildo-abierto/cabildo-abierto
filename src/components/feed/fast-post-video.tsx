"use client"
import {FastPostProps} from "@/lib/definitions";
import {VideoEmbed} from "./video-embed";


export const FastPostVideo = ({post}: {post: FastPostProps}) => {
    if(!post.content.post.embed){
        return null
    }

    const embed = JSON.parse(post.content.post.embed)

    if(embed.video){
        return <VideoEmbed post={post} blob={embed.video}/>
    }
    return null
}
"use client"
import {FastPostProps} from "@/lib/definitions";
import Image from "next/image";
import {useEffect, useState} from "react";
import {getBlobUrl} from "@/server-actions/blob";
import {VideoPlayer} from "./video-player";


export const VideoEmbed = ({post, blob}: {post: FastPostProps, blob: {ref: {$link: string}}}) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVideo(){
            const url = await getBlobUrl({cid: blob.ref.$link, authorId: post.author.did})

            if(url) setVideoUrl(url)
        }
        if(!videoUrl && blob && post){
            fetchVideo()
        }
    }, [blob, post])

    const thumbnailSrc = "https://video.bsky.app/watch/" + post.author.did + "/" +  blob.ref.$link + "/thumbnail.jpg"
    return <div
        onClick={(e) => {e.preventDefault(); e.stopPropagation()}}
        className="mt-2"
    >
        {videoUrl ? (
            <VideoPlayer videoUrl={videoUrl}/>
        ) : (
            <Image
                src={thumbnailSrc}
                width={300}
                height={300}
                alt="video"
                className="w-full h-auto max-h-[515px] rounded-lg border"
            />
        )}
    </div>
}

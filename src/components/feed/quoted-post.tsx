"use client"
import {EmbedProps, FastPostProps} from "../../app/lib/definitions";
import {BskyRichTextContent} from "./bsky-rich-text-content";
import {ContentTopRowAuthor} from "../content-top-row-author";
import Image from 'next/image'
import {DateSince} from "../date";
import {contentUrl} from "../utils";
import {FastPostImage} from "./fast-post-image";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import LoadingSpinner from "../loading-spinner";
import {getBskyFastPost} from "../../actions/contents";
import {FastPostVideo} from "./fast-post-video";
import {PlotInPost} from "./plot-in-post";
import {ExternalEmbedInPost} from "./external-embed-in-post";


const QuotedPostFromUri = ({uri}: {uri: string}) => {
    const [post, setPost] = useState<{post?: FastPostProps, error?: string} | null>(null)

    useEffect(() => {
        async function getPost(){
            const formattedPost = await getBskyFastPost(uri)

            setPost(formattedPost)
        }

        if(!post){
            getPost()
        }
    }, [])

    if(!post){
        return <div className={"h-full py-4"}>
            <LoadingSpinner/>
        </div>
    }

    return <QuotedPost maybePost={post}/>
}


export const QuotedPostFromEmbed = ({embedStr}: {embedStr: string}) => {
    const embed = JSON.parse(embedStr)

    if(embed.$type == "app.bsky.embed.record") {
        return <QuotedPostFromUri uri={embed.record.uri}/>
    } else if(embed.$type == "app.bsky.feed.record#recordView"){
        return <div>Acá debería haber un quoted post</div>
    }
}


// "post" is the quoted post
export const QuotedPost = ({maybePost}: {maybePost: {post?: FastPostProps, error?: string}}) => {
    const router = useRouter()

    if(maybePost.error) {
        return <div className={"rounded-lg border p-3 mt-2"}>
            No se encontró el post.
        </div>
    }

    const post = maybePost.post

    const url = contentUrl(post.uri, post.author.handle)

    return <div onClick={(e) => {e.preventDefault(); e.stopPropagation(); router.push(url)}}>
        <div className={"rounded-lg border p-3 mt-2"}>
            <div className={"flex items-center space-x-1 text-[var(--text-light)]"}>
                <div>
                    <Image
                        src={post.author.avatar}
                        alt={"Foto de perfil de @" + post.author.handle}
                        width={50}
                        height={50}
                        className={"w-4 h-4 rounded-full"}
                    />
                </div>
                <ContentTopRowAuthor author={post.author}/>
                <span className="">•</span>
                <div><DateSince date={post.createdAt}/></div>
            </div>
            <div>
                <BskyRichTextContent content={post.content}/>
            </div>
            <FastPostImage post={post} did={post.author.did}/>
            <FastPostVideo post={post}/>
            {post.content.post.embed && <QuotedPostFromEmbed embedStr={post.content.post.embed}/>}
            <PlotInPost post={post}/>
            <ExternalEmbedInPost post={post}/>
        </div>
    </div>
}
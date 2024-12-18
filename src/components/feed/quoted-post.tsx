"use client"
import {EmbedProps, FastPostProps} from "../../app/lib/definitions";
import {BskyRichTextContent} from "./bsky-rich-text-content";
import {ContentTopRowAuthor} from "../content-top-row-author";
import Image from 'next/image'
import {DateSince} from "../date";
import {contentUrl, getDidFromUri} from "../utils";
import {BskyFastPostImage} from "./bsky-fast-post-image";
import {useRouter} from "next/navigation";



export const QuotedPost = ({post}: {post: FastPostProps}) => {
    const router = useRouter()

    const embedStr = post.content.post.embed

    if(!embedStr){
        return <></>
    }

    const embed: EmbedProps = JSON.parse(embedStr)

    if(embed.$type != "app.bsky.embed.record#view"){
        return <></>
    }

    if(embed.record.$type == "app.bsky.embed.record#viewBlocked"){
        return <div className={"rounded-lg border p-3 mt-2"}>Bloqueado</div>
    }

    const url = contentUrl(embed.record.uri, embed.record.value.$type, embed.record.author.handle)

    return <div onClick={(e) => {e.preventDefault(); e.stopPropagation(); router.push(url)}}>
        <div className={"rounded-lg border p-3 mt-2"}>
            <div className={"flex items-center space-x-1 text-[var(--text-light)]"}>
                <div>
                    <Image
                        src={embed.record.author.avatar}
                        alt={"Foto de perfil de @" + embed.record.author.handle}
                        width={50}
                        height={50}
                        className={"w-4 h-4 rounded-full"}
                    />
                </div>
                <ContentTopRowAuthor author={embed.record.author}/>
                <span className="">•</span>
                <div><DateSince date={embed.record.value.createdAt}/></div>
            </div>
            <div>
                <BskyRichTextContent content={embed.record.value}/>
            </div>
            <BskyFastPostImage post={post} did={getDidFromUri(embed.record.uri)}/>
        </div>
    </div>
}
import {FastPostProps} from "../../app/lib/definitions";
import {BskyRichTextContent} from "./bsky-rich-text-content";
import {ContentTopRowAuthor} from "../content-top-row-author";
import Image from 'next/image'
import {DateSince} from "../date";
import Link from "next/link";
import {contentUrl} from "../utils";
import {BskyFastPostImage} from "./bsky-fast-post-image";


export function getDidFromUri (uri: string) {
    return uri.split("/")[2]
}


export const QuotedPost = ({content}: {content: FastPostProps}) => {


    if(!content.embed || content.embed.$type != "app.bsky.embed.record#view"){
        return <></>
    }

    const url = contentUrl(content.embed.record.uri, content.embed.record.value.$type, content.embed.record.author.handle)

    return <Link onClick={(e) => {e.preventDefault(); e.stopPropagation()}} href={url}>
        <div className={"rounded-lg border p-3 mt-2"}>
            <div className={"flex items-center space-x-1 text-[var(--text-light)]"}>
                <div>
                    <Image
                        src={content.embed.record.author.avatar}
                        alt={"Foto de perfil de @" + content.embed.record.author.handle}
                        width={50}
                        height={50}
                        className={"w-4 h-4 rounded-full"}
                    />
                </div>
                <ContentTopRowAuthor content={content.embed.record}/>
                <span className="">•</span>
                <div><DateSince date={content.embed.record.value.createdAt}/></div>
            </div>
            <div>
                <BskyRichTextContent record={content.embed.record.value}/>
            </div>
            <BskyFastPostImage content={content.embed.record.value} did={getDidFromUri(content.embed.record.uri)}/>
        </div>
    </Link>
}
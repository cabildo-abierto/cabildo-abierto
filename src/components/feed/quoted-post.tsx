"use client"
import {FastPostProps} from "@/lib/definitions";
import {BskyRichTextContent} from "./bsky-rich-text-content";
import {ContentTopRowAuthor} from "./content-top-row-author";
import Image from 'next/image'
import {DateSince} from "../../../modules/ui-utils/src/date";
import {FastPostImages} from "./fast-post-images";
import {useRouter} from "next/navigation";
import {FastPostVideo} from "./fast-post-video";
import {PlotInPost} from "./plot-in-post";
import {ExternalEmbedInPost} from "./external-embed-in-post";
import {contentUrl, userUrl} from "@/utils/uri";
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";
import {formatIsoDate} from "@/utils/dates";
import {ProfilePic} from "@/components/feed/profile-pic";
import Link from "next/link";


export const QuotedPostFromEmbed = ({embedStr}: {embedStr: string}) => {
    const embed = JSON.parse(embedStr)

    if(embed.collection == "app.bsky.feed.post") {
        return <QuotedPost post={embed}/>
    }
}


// "post" is the quoted post
export const QuotedPost = ({post}: {post: FastPostProps}) => {
    const router = useRouter()

    const url = contentUrl(post.uri)

    return <div
        className={"rounded-lg border p-3 mt-2 hover:bg-[var(--background-dark2)]"}
        onClick={(e) => {e.preventDefault(); e.stopPropagation(); router.push(url)}}>
        <div className={"flex items-center space-x-1 text-[var(--text-light)]"}>
            <Link
                href={userUrl(post.author.handle)}
                onClick={(e) => {e.stopPropagation()}}
                className="flex items-center justify-center"
            >
                <ProfilePic
                    user={post.author}
                    className={"rounded-full w-4 h-4"}
                />
            </Link>
            <span className="truncate">
                <ContentTopRowAuthor author={post.author} />
            </span>
            <span className="text-[var(--text-light)]">·</span>
            <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(post.createdAt)}>
                <DateSince date={post.createdAt} />
            </span>
        </div>
        <div>
            <BskyRichTextContent content={post.content}/>
        </div>
        <FastPostImages post={post} did={post.author.did}/>
        <FastPostVideo post={post}/>
        {post.content.post.embed && <QuotedPostFromEmbed embedStr={post.content.post.embed}/>}
        <PlotInPost post={post}/>
        <ExternalEmbedInPost post={post}/>
    </div>
}
"use client"

import {ContentTopRowAuthor} from "@/components/feed/frame/content-top-row-author";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {useRouter} from "next/navigation";
import {contentUrl, getBlueskyUrl, profileUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {ProfilePic} from "@/components/profile/profile-pic";
import Link from "next/link";
import {ATProtoStrongRef} from "@/lib/types";
import {PostEmbed} from "@/components/feed/embed/post-embed";
import {AppBskyEmbedRecord} from "@atproto/api"
import {AppBskyFeedPost} from "@atproto/api"

import dynamic from "next/dynamic";
const BskyRichTextContent = dynamic(() => import('@/components/feed/post/bsky-rich-text-content'), {
    ssr: false,
    loading: () => <></>,
});

type PostRecordEmbedRecordProps = {
    record: AppBskyEmbedRecord.View["record"]
    mainPostRef?: ATProtoStrongRef
    navigateOnClick?: boolean
}

export const PostRecordEmbedRecord = ({record, mainPostRef, navigateOnClick=true}: PostRecordEmbedRecordProps) => {
    const router = useRouter()

    if (AppBskyEmbedRecord.isViewRecord(record)) {
        const url = contentUrl(record.uri)
        const author = record.author
        const createdAt = new Date(record.indexedAt)

        return <div
            className={"embed-panel p-3"}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if(navigateOnClick) {
                    router.push(url)
                }
            }}
        >
            <div className={"flex items-center space-x-1 text-[var(--text-light)]"}>
                <Link
                    href={profileUrl(author.handle)}
                    onClick={(e) => {
                        e.stopPropagation()
                        if(!navigateOnClick) e.preventDefault()
                    }}
                    className="flex items-center justify-center"
                >
                    <ProfilePic
                        user={author}
                        className={"rounded-full w-4 h-4"}
                    />
                </Link>
                <span className="truncate text-sm">
                    <ContentTopRowAuthor
                        author={{
                            ...author,
                            $type: "ar.cabildoabierto.actor.defs#profileViewBasic",
                            verification: null,
                        }}
                    />
                </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div>
                <BskyRichTextContent
                    namespace={record.uri}
                    post={record.value as AppBskyFeedPost.Record}
                />
            </div>
            {/* TO DO: Entender por qué puede haber más de un embed */}
            {record.embeds && record.embeds.length > 0 && <PostEmbed embed={record.embeds[0]} mainPostRef={mainPostRef}/>}
        </div>
    } else if(AppBskyEmbedRecord.isViewDetached(record)){
        return <div className={"p-3 mt-2 border rounded-lg text-[var(--text-light)]"}>
            Eliminado
        </div>
    } else if(AppBskyEmbedRecord.isViewBlocked(record)){
        return <div className={"p-3 mt-2 border rounded-lg text-[var(--text-light)]"}>
            Contenido bloqueado
        </div>
    } else if(AppBskyEmbedRecord.isViewNotFound(record)){
        return <div className={"p-3 mt-2 border rounded-lg text-[var(--text-light)]"}>
            No encontrado
        </div>
    } else {
        /* TO DO: Dar un poco más de info */
        return <div className={"p-3 mt-2 border"}>
            <span>
                No sabemos cómo mostrarte este contenido,
            </span>
            <span
                className={"text-[var(--text-light)] hover:underline ml-1 cursor-pointer"}
                onClick={(e) => {e.stopPropagation(); window.open(getBlueskyUrl(mainPostRef.uri), "_blank")}}>
                miralo en Bluesky
            </span>
            <span>
                .
            </span>
        </div>
    }
}

type PostRecordEmbedProps = {
    embed: AppBskyEmbedRecord.View
    mainPostRef?: ATProtoStrongRef
    navigateOnClick?: boolean
}

export const PostRecordEmbed = ({embed, mainPostRef, navigateOnClick}: PostRecordEmbedProps) => {
    const record = embed.record
    return <PostRecordEmbedRecord
        record={record}
        mainPostRef={mainPostRef}
        navigateOnClick={navigateOnClick}
    />
}


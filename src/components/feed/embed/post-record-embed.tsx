"use client"

import {BskyRichTextContent} from "../post/bsky-rich-text-content";
import {ContentTopRowAuthor} from "@/components/feed/frame/content-top-row-author";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {useRouter} from "next/navigation";
import {contentUrl, getBlueskyUrl, profileUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {ProfilePic} from "@/components/profile/profile-pic";
import Link from "next/link";
import {View as RecordEmbedView, isViewRecord, isViewBlocked, isViewNotFound, isViewDetached} from "@/lex-api/types/app/bsky/embed/record"
import {ATProtoStrongRef, PostRecord} from "@/lib/types";
import {PostEmbed} from "@/components/feed/embed/post-embed";

type PostRecordEmbedRecordProps = {
    record: RecordEmbedView["record"]
    mainPostRef?: ATProtoStrongRef
    navigateOnClick?: boolean
}

export const PostRecordEmbedRecord = ({record, mainPostRef, navigateOnClick=true}: PostRecordEmbedRecordProps) => {
    const router = useRouter()

    if (isViewRecord(record)) {
        const url = contentUrl(record.uri)
        const author = record.author
        const createdAt = new Date(record.indexedAt)

        return <div
            className={"rounded-lg border p-3 hover:bg-[var(--background-dark2)]"}
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
                    <ContentTopRowAuthor author={{$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...author}}/>
                </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div>
                <BskyRichTextContent
                    namespace={record.uri}
                    post={record.value as PostRecord}
                />
            </div>
            {/* TO DO: Entender por qué puede haber más de un embed */}
            {record.embeds && record.embeds.length > 0 && <PostEmbed embed={record.embeds[0]} mainPostRef={mainPostRef}/>}
        </div>
    } else if(isViewDetached(record)){
        return <div className={"p-3 mt-2 border rounded-lg text-[var(--text-light)]"}>
            Eliminado
        </div>
    } else if(isViewBlocked(record)){
        return <div className={"p-3 mt-2 border rounded-lg text-[var(--text-light)]"}>
            Contenido bloqueado
        </div>
    } else if(isViewNotFound(record)){
        return <div className={"p-3 mt-2 border rounded-lg text-[var(--text-light)]"}>
            No encontrado
        </div>
    } else {
        /* TO DO: Dar un poco más de info */
        return <div className={"p-3 mt-2 border rounded-lg"}>
            <span>
                No sabemos cómo mostrarte este contenido,
            </span>
            <span
                className={"text-[var(--primary)] hover:underline ml-1 cursor-pointer"}
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
    embed: RecordEmbedView
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


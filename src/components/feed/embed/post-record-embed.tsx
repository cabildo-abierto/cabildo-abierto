"use client"

import {BskyRichTextContent} from "../post/bsky-rich-text-content";
import {ContentTopRowAuthor} from "@/components/feed/frame/content-top-row-author";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {useRouter} from "next/navigation";
import {contentUrl, getBlueskyUrl, userUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {ProfilePic} from "@/components/profile/profile-pic";
import Link from "next/link";
import {View as RecordEmbedView, isViewRecord, isViewBlocked, isViewNotFound, isViewDetached} from "@/lex-api/types/app/bsky/embed/record"
import {ATProtoStrongRef, PostRecord} from "@/lib/types";
import {PostEmbed} from "@/components/feed/embed/post-embed";

type PostRecordEmbedRecordProps = {
    record: RecordEmbedView["record"]
    mainPostRef: ATProtoStrongRef
}

export const PostRecordEmbedRecord = ({record, mainPostRef}: PostRecordEmbedRecordProps) => {
    const router = useRouter()

    if (isViewRecord(record)) {
        const url = contentUrl(record.uri)
        const author = record.author
        const createdAt = new Date(record.indexedAt)

        return <div
            className={"rounded-lg border p-3 mt-2 hover:bg-[var(--background-dark2)]"}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(url)
            }}
        >
            <div className={"flex items-center space-x-1 text-[var(--text-light)]"}>
                <Link
                    href={userUrl(author.handle)}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    className="flex items-center justify-center"
                >
                    <ProfilePic
                        user={author}
                        className={"rounded-full w-4 h-4"}
                    />
                </Link>
                <span className="truncate">
                    <ContentTopRowAuthor author={author}/>
                </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div>
                <BskyRichTextContent post={record.value as PostRecord}/>
            </div>
            {/* TO DO: Entender por qué puede haber más de un embed */}
            {record.embeds && record.embeds.length > 0 && <PostEmbed embed={record.embeds[0]} mainPostRef={mainPostRef}/>}
        </div>
    } else if(isViewDetached(record)){
        return <div className={"p-3 mt-2 border rounded-lg"}>
            Eliminado
        </div>
    } else if(isViewBlocked(record)){
        return <div className={"p-3 mt-2 border rounded-lg"}>
            Contenido bloqueado
        </div>
    } else if(isViewNotFound(record)){
        return <div className={"p-3 mt-2 border rounded-lg"}>
            No encontrado
        </div>
    } else {
        /* TO DO: Dar un poco más de info */
        return <div className={"p-3 mt-2 border rounded-lg flex space-x-1"}>
            <span>
                No sabemos cómo mostrarte este contenido,
            </span>
            <button
                className={"text-[var(--primary)] hover:underline"}
                onClick={() => {window.open(getBlueskyUrl(mainPostRef.uri), "_blank")}}>
                miralo en Bluesky
            </button>
            <span>
                .
            </span>
        </div>
    }
}

type PostRecordEmbedProps = {
    embed: RecordEmbedView
    mainPostRef: ATProtoStrongRef
}

export const PostRecordEmbed = ({embed, mainPostRef}: PostRecordEmbedProps) => {
    const record = embed.record
    return <PostRecordEmbedRecord
        record={record}
        mainPostRef={mainPostRef}
    />
}


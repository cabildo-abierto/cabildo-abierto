"use client"

import {DateSince} from "../../layout/utils/date";
import {useRouter} from "next/navigation";
import {contentUrl, getBlueskyUrl, profileUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {ProfilePic} from "@/components/profile/profile-pic";
import Link from "next/link";
import {ATProtoStrongRef} from "@/lib/types";
import {PostEmbed} from "@/components/feed/embed/post-embed";
import {$Typed, AppBskyEmbedRecord} from "@atproto/api"
import {AppBskyFeedPost} from "@atproto/api"
import {ArCabildoabiertoActorDefs, ArCabildoabiertoEmbedRecord, ArCabildoabiertoFeedArticle} from "@/lex-api/index"
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {CustomLink} from "@/components/layout/utils/custom-link";
import ValidationIcon from "@/components/profile/validation-icon";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import dynamic from "next/dynamic";
import {ArticlePreviewContent} from "@/components/feed/article/article-preview";


const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"), {
    ssr: false,
    loading: () => <></>
})


const BskyRichTextContent = dynamic(() => import('@/components/feed/post/bsky-rich-text-content'), {
    ssr: false,
    loading: () => <></>,
});

type PostRecordEmbedRecordProps = {
    record: ArCabildoabiertoEmbedRecord.View["record"]
    mainPostRef?: ATProtoStrongRef
    navigateOnClick?: boolean
}

export const PostRecordEmbedRecord = ({
    record,
    mainPostRef,
    navigateOnClick=true
}: PostRecordEmbedRecordProps) => {
    const router = useRouter()

    if (ArCabildoabiertoEmbedRecord.isViewRecord(record)) {
        const author = record.author
        const url = contentUrl(record.uri, author.handle)
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
                <EmbedAuthor
                    url={profileUrl(author.handle)}
                    author={{
                        ...author,
                        $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
                    }}
                />
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


export const EmbedAuthor = ({
                                url,
                                author,

                            }: {
    url: string
    author: $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic>
}) => {
    const {isMobile} = useLayoutConfig()
    return <CustomLink
        tag={"span"}
        onClick={(e) => {
            e.stopPropagation()
        }}
        href={url}
    >
        <UserSummaryOnHover handle={author.handle}>
            <div className={"flex justify-between items-center space-x-1"}>
                <div className={"flex space-x-1 items-center"}>
                    <div className={"hover:underline font-bold truncate " + (isMobile ? "max-w-[30vw]": "max-w-[280px]")}>
                        {author.displayName ? author.displayName : author.handle}
                    </div>
                    {ArCabildoabiertoActorDefs.isProfileViewBasic(author) && <ValidationIcon
                        fontSize={15}
                        handle={author.handle}
                        verification={author.verification}
                    />}
                    <div className={"text-[var(--text-light)] truncate " + (isMobile ? "max-w-[16vw]": "max-w-[160px]")}>
                        @{author.handle}
                    </div>
                </div>
                {!author.caProfile &&
                    <div className={"pb-[2px]"}><BlueskyLogo className={"w-auto h-[10px]"}/></div>}
            </div>
        </UserSummaryOnHover>
    </CustomLink>
}



export const PostRecordEmbed = ({embed, navigateOnClick=true, mainPostRef}: {
    embed: ArCabildoabiertoEmbedRecord.View
    navigateOnClick?: boolean
    mainPostRef?: ATProtoStrongRef
}) => {
    const record = embed.record
    const router = useRouter()

    if(ArCabildoabiertoEmbedRecord.isViewArticleRecord(record)){
        const summary = record.summary
        const title = (record.value as ArCabildoabiertoFeedArticle.Record).title
        const author = record.author
        const createdAt = record.indexedAt
        const url = contentUrl(record.uri, author.handle)

        return <div
            className={"p-3 embed-panel"}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
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
                <EmbedAuthor
                    url={profileUrl(author.handle)}
                    author={{$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...author}}/>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div className={"mt-1"}>
                <ArticlePreviewContent
                    title={title} summary={summary} color={"transparent"} clickable={false}
                />
            </div>
        </div>
    } else if(ArCabildoabiertoEmbedRecord.isViewRecord(record)) {
        console.log("record", record)
        return <PostRecordEmbedRecord
            record={record}
            mainPostRef={mainPostRef}
            navigateOnClick={navigateOnClick}
        />
    } else {
        return <div className={"p-3 border rounded-lg"}>
            Ocurrió un error al mostrar el contenido
        </div>
    }
}

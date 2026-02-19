"use client"

import {DateSince} from "@/components/utils/base/date";
import {useRouter} from "next/navigation";
import {formatIsoDate} from "@cabildo-abierto/utils";
import {ProfilePic} from "../../perfil/profile-pic";
import Link from "next/link";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {PostEmbed} from "./post-embed";
import {$Typed, AppBskyEmbedRecord} from "@atproto/api"
import {AppBskyFeedPost} from "@atproto/api"
import {ArCabildoabiertoActorDefs, ArCabildoabiertoEmbedRecord, ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import ValidationIcon from "../../perfil/validation-icon";
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import {colorFromString} from "../article/article-preview";
import {contentUrl, getBlueskyUrl, profileUrl} from "@/components/utils/react/url";
import {CustomLink} from "@/components/utils/base/custom-link";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {ArticleIcon} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import {useTheme} from "@/components/layout/theme/theme-context";
import { Note } from "@/components/utils/base/note";


const UserSummaryOnHover = dynamic(() => import("../../perfil/user-summary"), {
    ssr: false,
    loading: () => <></>
})


const BskyRichTextContent = dynamic(() => import('../post/bsky-rich-text-content'), {
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
        const recordMain = record.value as AppBskyFeedPost.Record

        return <div
            className={"embed-panel cursor-pointer p-3"}
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
                    post={recordMain}
                />
            </div>
            {/* TO DO: Entender por qué puede haber más de un embed */}
            {record.embeds && record.embeds.length > 0 && <PostEmbed
                embed={record.embeds[0]}
                mainPostRef={mainPostRef}
            />}
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
    const theme = useTheme()

    if(ArCabildoabiertoEmbedRecord.isViewArticleRecord(record)) {
        const summary = record.summary
        const article = record.value as ArCabildoabiertoFeedArticle.Record
        const title = article.title
        const author = record.author
        const url = contentUrl(record.uri, author.handle)
        const bgColor = colorFromString(record.uri, theme.currentTheme)
        const thumb = record.preview?.thumb

        return <CustomLink
            tag={"div"}
            href={url}
            className={cn("embed-panel cursor-pointer flex hover:bg-[var(--background-dark)]")}
        >
            <div className={"flex h-full w-full"}>
                <div className={"flex flex-col w-full"}>
                    {thumb && thumb.length > 0 ?
                        <div className={"w-full relative"}>
                            <Image
                                src={thumb}
                                alt={""}
                                className="w-full max-h-[240px] object-cover"
                                width={400}
                                height={300}
                            />
                            <div className="
                              absolute top-2 right-2
                              bg-black/40
                              px-2 py-0.5
                              text-[11px]
                              uppercase tracking-wide
                              rounded
                            ">
                                Artículo
                            </div>
                        </div> :
                        <div className={"w-full relative"}>
                            <div
                                className="w-full h-[200px] object-cover flex justify-center items-center"
                                style={{ backgroundColor: bgColor }}
                            >
                                <ArticleIcon weight={"light"} fontSize={170}
                                             className={"text-[var(--text-light)] opacity-20"}/>
                            </div>
                            <div className="
                              absolute top-2 right-2
                              bg-black/40
                              px-2 py-0.5
                              text-[11px]
                              uppercase tracking-wide
                              rounded
                            ">
                                Artículo
                            </div>
                        </div>
                    }
                    <div className={cn("p-2")}>
                        <div className="text-[17px] font-semibold break-words">
                            {title ?? url}
                        </div>
                        <div className="text-sm text-[15px] line-clamp-2 font-light pb-1">
                            {summary}
                        </div>
                        <div className={"flex space-x-1 items-center"}>
                            <ProfilePic user={author} className={"rounded-full h-[14px] w-[14px]"}/>
                            <CustomLink
                                href={profileUrl(author.handle)}
                                className={"text-[14px] font-medium space-x-1"}
                            >
                                <UserSummaryOnHover handle={author.handle}>
                                    <div className={"flex space-x-1"}>
                                        <span className={"hover:underline"}>
                                        {author.displayName ?? `@${author.handle}`}
                                        </span>
                                                                <span className={"text-[var(--text-light)] hover:underline"}>
                                            @{author.handle}
                                        </span>
                                    </div>
                                </UserSummaryOnHover>
                            </CustomLink>
                            <ValidationIcon verification={author.verification} fontSize={14}/>
                        </div>
                    </div>
                </div>
            </div>
        </CustomLink>
    } else if(ArCabildoabiertoEmbedRecord.isViewRecord(record)) {
        return <PostRecordEmbedRecord
            record={record}
            mainPostRef={mainPostRef}
            navigateOnClick={navigateOnClick}
        />
    } else if(AppBskyEmbedRecord.isViewNotFound(record)) {
        return <Note className={"p-3 border text-left"}>
            No se encontró el contenido
        </Note>
    } else {
        return <Note className={"p-3 border text-left"}>
            Ocurrió un error al mostrar el contenido
        </Note>
    }
}

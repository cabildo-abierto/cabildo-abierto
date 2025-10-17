import {ArticlePreviewContent} from "@/components/feed/article/article-preview";
import Link from "next/link";
import {contentUrl, profileUrl} from "@/utils/uri";
import {ProfilePic} from "@/components/profile/profile-pic";
import {DateSince} from "../../layout/utils/date";
import {formatIsoDate} from "@/utils/dates";
import {useRouter} from "next/navigation";
import {ATProtoStrongRef} from "@/lib/types";
import {PostEmbed} from "@/components/feed/embed/post-embed";
import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {$Typed, AppBskyFeedPost} from "@atproto/api";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedRecord, ArCabildoabiertoActorDefs} from "@/lex-api/index"
import ValidationIcon from "@/components/profile/validation-icon";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {CustomLink} from "../../layout/utils/custom-link";
import dynamic from "next/dynamic";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {AppBskyActorDefs} from "@atproto/api"


const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"), {
    ssr: false,
    loading: () => <></>
});


export const EmbedAuthor = ({
    url,
    author,

                            }: {
    url: string
    author: $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic> | $Typed<AppBskyActorDefs.ProfileViewBasic>

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
                {(AppBskyActorDefs.isProfileViewBasic(author) || !author.caProfile) &&
                    <div className={"pb-[2px]"}><BlueskyLogo className={"w-auto h-[10px]"}/></div>}
            </div>
        </UserSummaryOnHover>
    </CustomLink>
}


export const CAPostRecordEmbed = ({embed, navigateOnClick=true, mainPostRef}: {
    embed: ArCabildoabiertoEmbedRecord.View
    navigateOnClick?: boolean
    mainPostRef?: ATProtoStrongRef
}) => {
    const record = embed.record
    const router = useRouter()

    if(ArCabildoabiertoFeedDefs.isArticleView(record) || ArCabildoabiertoFeedDefs.isFullArticleView(record)){
        const summary = record.summary
        const title = record.title
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
                <EmbedAuthor url={profileUrl(author.handle)} author={{$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...author}}/>
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
    } else if(ArCabildoabiertoFeedDefs.isPostView(record)) {
        const author = record.author
        const url = contentUrl(record.uri, author.handle)
        const createdAt = new Date(record.indexedAt)

        return <div
            className={"p-3 embed-panel"}
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
                <EmbedAuthor url={profileUrl(author.handle)} author={{$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...author}}/>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div>
                <BskyRichTextContent post={record.record as AppBskyFeedPost.Record}/>
            </div>
            {record.embed && <PostEmbed embed={record.embed} mainPostRef={mainPostRef}/>}
        </div>
    } else {
        return <div className={"p-3 border rounded-lg"}>
            Ocurrió un error al mostrar el contenido
        </div>
    }
}
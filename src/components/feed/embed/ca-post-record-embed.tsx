import {View as CARecordEmbedView} from "@/lex-api/types/ar/cabildoabierto/embed/record"
import {ArticlePreviewContent} from "@/components/feed/article/article-preview";
import {isArticleView, isFullArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import Link from "next/link";
import {contentUrl, profileUrl} from "@/utils/uri";
import {ProfilePic} from "@/components/profile/profile-pic";
import {ContentTopRowAuthor} from "@/components/feed/frame/content-top-row-author";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {formatIsoDate} from "@/utils/dates";
import {useRouter} from "next/navigation";
import {ATProtoStrongRef, PostRecord} from "@/lib/types";
import {isPostView as isCAPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import {BskyRichTextContent} from "@/components/feed/post/bsky-rich-text-content";
import {PostEmbed} from "@/components/feed/embed/post-embed";



export const CAPostRecordEmbed = ({embed, navigateOnClick=true, mainPostRef}: {
    embed: CARecordEmbedView
    navigateOnClick?: boolean
    mainPostRef?: ATProtoStrongRef
}) => {
    const record = embed.record
    const router = useRouter()

    if(isArticleView(record) || isFullArticleView(record)){
        const summary = record.summary
        const title = record.title
        const author = record.author
        const createdAt = record.indexedAt
        const url = contentUrl(record.uri)

        return <div
            className={"rounded-lg border p-3 hover:bg-[var(--background-ldark2)]"}
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
                    <ContentTopRowAuthor author={author}/>
                </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div className={"mt-2"}>
                <ArticlePreviewContent
                    title={title} summary={summary} color={"transparent"} clickable={false}
                />
            </div>
        </div>
    } else if(isCAPostView(record)) {
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
                    <ContentTopRowAuthor author={author}/>
                </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                    <DateSince date={createdAt}/>
                </span>
            </div>
            <div>
                <BskyRichTextContent post={record.record as PostRecord}/>
            </div>
            {record.embed && <PostEmbed embed={record.embed} mainPostRef={mainPostRef}/>}
        </div>
    } else {
        return <div className={"p-3 border rounded-lg"}>
            Ocurrió un error al mostrar el contenido
        </div>
    }
}
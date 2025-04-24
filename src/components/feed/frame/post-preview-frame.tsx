import { DateSince } from '../../../../modules/ui-utils/src/date'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ContentTopRowAuthor } from '@/components/feed/frame/content-top-row-author'
import { ReactNode } from 'react'
import { EngagementIcons } from '@/components/feed/frame/engagement-icons'
import {RepostedBy} from "../post/reposted-by";
import {ProfilePic} from "../../profile/profile-pic";
import {urlFromRecord, userUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {emptyChar} from "@/utils/utils";
import {useSWRConfig} from "swr";
import {ReasonRepost} from '@/lex-api/types/app/bsky/feed/defs'
import {ArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"
import {Record as PostRecord} from "@/lex-api/types/app/bsky/feed/post"
import {isSelfLabels} from "@/lex-api/types/com/atproto/label/defs";
import {$Typed} from "@atproto/api";


export const hasEnDiscusionLabel = (postView: PostView | ArticleView) => {
    const post = postView.record as ArticleRecord | PostRecord
    return isSelfLabels(post.labels) && post.labels.values.some((x) => x.val == "en discusion")
}


export const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}>{emptyChar}</div>
}

type FastPostPreviewFrameProps = {
    children: ReactNode
    postView: $Typed<PostView> | $Typed<ArticleView>
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    reason?: ReasonRepost
    onDelete?: () => Promise<void>
}

export const PostPreviewFrame = ({
    children,
    postView,
    borderBelow=true,
    showingParent=false,
    showingChildren=false,
    reason,
    onDelete
}: FastPostPreviewFrameProps) => {
    const router = useRouter()
    const url = urlFromRecord(postView.uri)

    const enDiscusion = hasEnDiscusionLabel(postView)
    const author = postView.author
    const createdAt = new Date(postView.indexedAt)

    async function onClick() {

        /*
        TO DO
        const threadData: ThreadProps = {
            post: post,
            replies: null
        };

        mutate(
            threadApiUrl(post.uri),
            undefined,
            {
                optimisticData: (currentData) => {
                    return currentData ? currentData : {thread: threadData, error: null}
                },
                populateCache: false,
                revalidate: false
            }
        )*/
        router.push(url);
    }

    return <div
        id={postView.uri}
        className={"flex flex-col max-[500px]:w-screen max-[680px]:w-[calc(100vw-80px)] hover:bg-[var(--background-dark)] cursor-pointer " + (borderBelow ? " border-b" : "")}
        onClick={onClick}
    >
        {reason && <RepostedBy user={reason.by}/>}
        <div className={"flex h-full items-stretch"}>
            <div className="w-[79px] flex flex-col items-center pl-2 ">
                {showingParent ? <ReplyVerticalLine className="h-2"/> : <div className="h-2">{emptyChar}</div>}
                <Link
                    href={userUrl(author.handle)}
                    onClick={(e) => {e.stopPropagation()}}
                    className="w-11 h-11 flex items-center justify-center"
                >
                    <ProfilePic
                        user={author}
                        className={"rounded-full w-11 h-11"}
                    />
                </Link>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="py-2 flex max-w-[519px] w-full flex-col pr-2">
                <div className="flex gap-x-1 max-w-[calc(100vw-80px)]">
                    <span className="truncate">
                        <ContentTopRowAuthor author={author} />
                    </span>
                    <span className="text-[var(--text-light)]">·</span>
                    <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(createdAt)}>
                        <DateSince date={createdAt} />
                    </span>
                </div>

                <div>
                    {children}
                </div>

                <div className={"mt-1 text-sm"}>
                    <EngagementIcons
                        content={postView}
                        className={"justify-between px-2"}
                        enDiscusion={enDiscusion}
                    />
                </div>
            </div>
        </div>
    </div>
}
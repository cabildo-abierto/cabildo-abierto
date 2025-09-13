import {DateSince} from '../../../../modules/ui-utils/src/date'
import {ContentTopRowAuthor} from '@/components/feed/frame/content-top-row-author'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {RepostedBy} from "../post/reposted-by";
import {ProfilePic} from "../../profile/profile-pic";
import {urlFromRecord, profileUrl, getCollectionFromUri, isPost} from "@/utils/uri";
import {emptyChar} from "@/utils/utils";
import {ReasonRepost} from '@/lex-api/types/app/bsky/feed/defs'
import {
    ArticleView,
    FullArticleView,
    PostView,
    isPostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {$Typed} from "@atproto/api";
import {useQueryClient} from "@tanstack/react-query";
import {threadQueryKey} from "@/queries/useThread";
import {ReplyToVersion} from "@/components/feed/frame/reply-to-version";
import { CustomLink } from '../../../../modules/ui-utils/src/custom-link'


export const hasEnDiscusionLabel = (postView: PostView | ArticleView | FullArticleView) => {
    const labels = postView.labels
    return labels && labels.some((x) => x.val == "ca:en discusión")
}


export const ReplyVerticalLine = ({className = ""}: { className?: string }) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}>{emptyChar}</div>
}

type FastPostPreviewFrameProps = {
    children: ReactNode
    postView: $Typed<PostView> | $Typed<ArticleView>
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    reason?: ReasonRepost
    pageRootUri?: string
}

export const PostPreviewFrame = ({
                                     children,
                                     postView,
                                     borderBelow = true,
                                     showingParent = false,
                                     showingChildren = false,
                                     reason,
                                     pageRootUri,
                                 }: FastPostPreviewFrameProps) => {
    const url = urlFromRecord(postView.uri)
    const qc = useQueryClient()

    const enDiscusion = hasEnDiscusionLabel(postView)
    const author = postView.author
    const createdAt = new Date(postView.indexedAt)

    const isOptimistic = postView.uri.includes("optimistic")

    async function onClick() {
        if(isPost(getCollectionFromUri(postView.uri)) && !isOptimistic){
            qc.setQueryData(threadQueryKey(postView.uri), old => {
                if(old) return old
                const t: ThreadViewContent = {
                    $type: "ar.cabildoabierto.feed.defs#threadViewContent",
                    content: postView,
                    replies: null
                }
                return t
            })
            qc.invalidateQueries({queryKey: threadQueryKey(postView.uri)})
        }
    }

    return <CustomLink
        tag={"div"}
        id={"discussion:" + postView.uri}
        className={"flex flex-col max-[500px]:w-screen max-[680px]:w-[calc(100vw-80px)] hover:bg-[var(--background-dark)] cursor-pointer " + (borderBelow ? " border-b" : "")}
        onClick={!isOptimistic ? onClick : undefined}
        href={!isOptimistic ? url : undefined}
    >
        {isPostView(postView) && <ReplyToVersion pageRootUri={pageRootUri} postView={postView}/>}
        {reason && <RepostedBy user={reason.by}/>}
        <div className={"flex h-full items-stretch"}>
            <div className="max-w-[13%] w-full flex flex-col items-center px-2">
                {showingParent ? <ReplyVerticalLine className="h-2"/> : <div className="h-2">{emptyChar}</div>}
                <CustomLink
                    tag={"span"}
                    href={profileUrl(author.handle)}
                    className="max-w-11 w-full flex items-center justify-center"
                >
                    <ProfilePic
                        user={author}
                        clickable={false}
                        className={"rounded-full w-full"}
                    />
                </CustomLink>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="py-2 flex w-full max-w-[86%] flex-col pr-2">
                <div className="flex gap-x-1 max-w-[calc(100vw-80px)]">
                    <div className="truncate">
                        <ContentTopRowAuthor author={{$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...author}}/>
                    </div>
                    <div className="text-[var(--text-light)]">·</div>
                    <div className="text-[var(--text-light)] flex-shrink-0" >
                        <DateSince date={createdAt}/>
                    </div>
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
    </CustomLink>
}
import {DateSince} from '../../layout/utils/date'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {RepostedBy} from "../post/reposted-by";
import {ProfilePic} from "../../profile/profile-pic";
import {profileUrl, getCollectionFromUri, isPost, contentUrl} from "@/utils/uri";
import {emptyChar} from "@/utils/utils";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {$Typed} from "@/lex-api/util";
import {useQueryClient} from "@tanstack/react-query";
import {threadQueryKey} from "@/queries/getters/useThread";
import {ReplyToVersion} from "@/components/feed/frame/reply-to-version";
import {CustomLink} from '../../layout/utils/custom-link'
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import ValidationIcon from "@/components/profile/validation-icon";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import dynamic from "next/dynamic";
import {CheckIcon, XIcon} from '@phosphor-icons/react';
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import DescriptionOnHover from "@/components/layout/utils/description-on-hover";

const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"), {
    ssr: false,
    loading: () => <></>
});
export const hasEnDiscusionLabel = (postView: ArCabildoabiertoFeedDefs.PostView | ArCabildoabiertoFeedDefs.ArticleView | ArCabildoabiertoFeedDefs.FullArticleView) => {
    const labels = postView.labels
    return labels && labels.some((x) => x.val == "ca:en discusión")
}


export const ReplyVerticalLine = ({className = ""}: { className?: string }) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}>{emptyChar}</div>
}

type FastPostPreviewFrameProps = {
    children: ReactNode
    postView: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    reason?: ArCabildoabiertoFeedDefs.ReasonRepost
    pageRootUri?: string
    engagementIcons?: boolean
    onWritePost?: boolean
}

export const PostPreviewFrame = ({
                                     children,
                                     postView,
                                     borderBelow = true,
                                     showingParent = false,
                                     showingChildren = false,
                                     reason,
                                     pageRootUri,
    onWritePost=false,
    engagementIcons = true
                                 }: FastPostPreviewFrameProps) => {
    const url = contentUrl(postView.uri, postView.author.handle)
    const qc = useQueryClient()
    const {isMobile} = useLayoutConfig()

    const enDiscusion = hasEnDiscusionLabel(postView)
    const author = postView.author

    const createdAt = new Date(postView.indexedAt)

    const isOptimistic = postView.uri.includes("optimistic")

    async function onClick() {
        if (isPost(getCollectionFromUri(postView.uri)) && !isOptimistic) {
            qc.setQueryData(threadQueryKey(postView.uri), old => {
                if (old) return old
                const t: ArCabildoabiertoFeedDefs.ThreadViewContent = {
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
        className={"flex flex-col " + (borderBelow ? "border-b" : "") + (engagementIcons ? " hover:bg-[var(--background-dark)] cursor-pointer" : "")}
        onClick={!isOptimistic && engagementIcons ? onClick : undefined}
        href={!isOptimistic && engagementIcons ? url : undefined}

    >
        {ArCabildoabiertoFeedDefs.isPostView(postView) && pageRootUri &&
        <ReplyToVersion
            pageRootUri={pageRootUri}
            postView={postView}
        />}
        {reason && <RepostedBy user={reason.by}/>}
        <div className={"flex h-full"}>
            <div className={"flex flex-col items-center pr-2 " + (engagementIcons ? "pl-4" : "")}>
                {showingParent ? <ReplyVerticalLine className="h-2"/> : <div className="h-2">{emptyChar}</div>}
                <CustomLink
                    tag={"span"}
                    href={profileUrl(author.handle)}
                    className={"relative flex items-center justify-center " + (isMobile ? "w-9" : "w-11")}
                >
                    {isPostView(postView) && postView.voteContext?.authorVotingState == "accept" && <DescriptionOnHover description={`@${postView.author.handle} votó a favor de esta versión del tema.`}>
                        <div className={"absolute top-0 right-0 bg-[var(--green-dark2)] text-[var(--text-light)] rounded-full items-center p-[2px]"}>
                            <CheckIcon fontSize={12}/>
                        </div>
                    </DescriptionOnHover>}
                    {isPostView(postView) && postView.voteContext?.authorVotingState == "reject" && <DescriptionOnHover description={`@${postView.author.handle} votó en contra de esta versión del tema.`}>
                        <div className={"absolute top-0 right-0 bg-[var(--red-dark2)] text-[var(--text-light)] rounded-full items-center p-[2px]"}>
                            <XIcon fontSize={12}/>
                        </div>
                    </DescriptionOnHover>}
                    <ProfilePic
                        user={author}
                        clickable={false}
                        className={"rounded-full w-full"}
                    />
                </CustomLink>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="py-2 flex w-full flex-col pr-2">
                <div className="flex items-center gap-x-1">
                    <CustomLink
                        tag={"span"}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        href={profileUrl(author.handle)}
                    >
                        <UserSummaryOnHover handle={author.handle}>
                            <div className={"flex justify-between items-center space-x-1"}>
                                <div className={"flex space-x-1 items-center"}>
                                    <div className={"hover:underline font-bold truncate " + (isMobile ? "max-w-[36vw]" : onWritePost ? "max-w-[200px]": "max-w-[300px]")}>
                                        {author.displayName ? author.displayName : author.handle}
                                    </div>
                                    <ValidationIcon fontSize={15} handle={author.handle}
                                                    verification={author.verification}/>
                                    <div className={"text-[var(--text-light)] truncate " + (isMobile ? "max-w-[20vw]" : onWritePost ? "max-w-[100px]": "max-w-[150px]")}>
                                        @{author.handle}
                                    </div>
                                </div>
                                {!author.caProfile &&
                                    <div className={"pb-[2px]"}><BlueskyLogo className={"w-auto h-[10px]"}/></div>}
                            </div>
                        </UserSummaryOnHover>
                    </CustomLink>
                    <div className="text-[var(--text-light)]">·</div>
                    <div className="text-[var(--text-light)] flex-shrink-0">
                        <DateSince date={createdAt}/>
                    </div>
                </div>

                <div>
                    {children}
                </div>

                {engagementIcons && <div className={"mt-1 text-sm"}>
                    <EngagementIcons
                        content={postView}
                        className={"px-2"}
                        enDiscusion={enDiscusion}
                        iconFontSize={18}
                        textClassName={"font-light text-[var(--text)] text-sm"}
                        iconHoverColor={"background-dark2"}
                    />
                </div>}
            </div>
        </div>
    </CustomLink>
}
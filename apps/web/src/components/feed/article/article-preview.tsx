import {ReplyVerticalLine} from '../utils/post-preview-frame'
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api";
import {$Typed} from "@atproto/api";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {ArticleOrExternalPreview} from "@/components/feed/article/article-or-external-preview";
import {contentUrl, profileUrl} from "@cabildo-abierto/utils";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {ArticleIcon} from "@phosphor-icons/react";
import {CustomLink} from "@/components/utils/base/custom-link";
import {EngagementIcons} from "@/components/feed/utils/engagement-icons";
import ValidationIcon from "@/components/perfil/validation-icon";
import {ProfilePic} from "@/components/perfil/profile-pic";
import dynamic from "next/dynamic";
import {useTheme} from "@/components/layout/theme/theme-context";
import {RepostedBy} from "@/components/feed/post/reposted-by";
import {DateSince} from "@/components/utils/base/date";

const UserSummaryOnHover = dynamic(() => import("../../perfil/user-summary"), {ssr: false});


export type ArticlePreviewProps = {
    feedViewContent: ArCabildoabiertoFeedDefs.FeedViewContent
    articleView: $Typed<ArCabildoabiertoFeedDefs.ArticleView>
    repostedBy?: { displayName?: string, handle: string }
    showingChildren?: boolean
}


export const ArticlePreviewContent = ({
                                          title,
                                          summary,
                                          image,
                                          onClick,
                                          uri
                                      }: {
    title: string,
    summary: string
    image?: string
    onClick?: () => void
    uri?: string
}) => {
    return <ArticleOrExternalPreview
        isArticle={true}
        description={summary}
        thumb={image}
        title={title}
        onClick={onClick}
        url={uri ? contentUrl(uri) : undefined}
    />
}


export function colorFromString(
    str: string,
    theme: "dark" | "light"
) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    let hue = Math.abs(hash) % 360

    // soften aggressive yellows / greens
    if (hue > 50 && hue < 90) {
        hue = (hue + 100) % 360
    }

    return theme === "dark"
        ? `hsl(${hue}, 25%, 18%)`
        : `hsl(${hue}, 28%, 90%)`
}


const ArticleBadge = () => {
    return <div className="
      absolute top-2 right-2
      bg-black
      bg-opacity-30
      px-2 py-0.5
      text-[11px]
      text-[var(--white-text)]
      uppercase tracking-wide
      rounded
    ">
        Artículo
    </div>
}


export const ArticlePreview = (
    {articleView, feedViewContent, showingChildren = false}: ArticlePreviewProps
) => {
    const article = articleView.record as ArCabildoabiertoFeedArticle.Record
    const summary = articleView.summary
    const title = article.title
    const reason = feedViewContent && feedViewContent.reason && ArCabildoabiertoFeedDefs.isReasonRepost(feedViewContent.reason) ? feedViewContent.reason : undefined
    const theme = useTheme()

    const bgColor = colorFromString(articleView.uri, theme.currentTheme)

    const url = contentUrl(articleView.uri)
    const thumb = articleView.preview?.thumb
    const author = articleView.author

    return <CustomLink
        tag={"div"}
        href={url}
        className={cn("cursor-pointer flex flex-col hover:bg-[var(--background-dark)]", !showingChildren && "border-b")}
    >
        {reason && <RepostedBy user={reason.by}/>}
        <div className={"flex h-full w-full pt-2"}>
            <div className={"flex flex-col items-center pr-2 pl-4"}>
                <div className={"w-11 flex flex-col items-center"}>
                    <ProfilePic
                        user={author}
                        className={"rounded-full w-full"}
                    />
                </div>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>
            <div className={"flex flex-col w-full pr-2"}>
                {thumb && thumb.length > 0 ?
                    <div className={"w-full relative"}>
                        <Image
                            src={thumb}
                            alt={""}
                            className="w-full max-h-[240px] object-cover"
                            width={400}
                            height={300}
                        />
                        <ArticleBadge/>
                    </div> :
                    <div className={"w-full relative"}>
                        <div
                            className="w-full h-[200px] object-cover flex justify-center items-center"
                            style={{backgroundColor: bgColor}}
                        >
                            <ArticleIcon weight={"light"} fontSize={170}
                                         className={"text-[var(--text-light)] opacity-20"}/>
                        </div>
                        <ArticleBadge/>
                    </div>
                }
                <div className={cn("pt-2 pb-1")}>
                    <div className="text-[17px] font-semibold break-words">
                        {title ?? url}
                    </div>
                    <div className="text-sm text-[15px] line-clamp-2 font-light pb-1">
                        {summary}
                    </div>
                    <div className={"flex space-x-1 items-center text-sm pb-2"}>
                        <CustomLink
                            tag={"div"}
                            href={profileUrl(author.handle)}
                            className={"text-[14px] font-medium space-x-1 flex"}
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
                        <div className="text-[var(--text-light)]">·</div>
                        <div className="text-[var(--text-light)] flex-shrink-0">
                            hace <DateSince date={article.createdAt}/>
                        </div>
                    </div>
                    <EngagementIcons
                        content={articleView}
                        iconSize={"default"}
                        textClassName={"font-light text-[var(--text)] text-sm"}
                    />
                </div>
            </div>
        </div>
    </CustomLink>
}
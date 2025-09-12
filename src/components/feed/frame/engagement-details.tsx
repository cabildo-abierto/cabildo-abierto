import {contentUrl} from "@/utils/uri";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import {$Typed} from "@atproto/api";
import Link from "next/link";

type EngagementDetailsProps = {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>
    showBsky: boolean
    small?: boolean
}


export const EngagementDetails = ({
                                    content,
                                    showBsky
                                }: EngagementDetailsProps) => {

    return <div className={"flex items-center exclude-links w-full space-x-3 border-b pb-2 px-2 mb-2"}>
        <RepostDetails
            content={content}
            showBsky={showBsky}
        />


        <LikesDetails
            content={content}
            showBsky={showBsky}
        />


        <QuotesDetails
            content={content}
            showBsky={showBsky}
        />
    </div>
}

const RepostDetails = ({content, showBsky}: {content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>, showBsky: boolean}) => {

    const url = contentUrl(content.uri) + "/reposted-by"

    return <Link className={"text-sm"}
        href={url}
        >
        {showBsky ? content.bskyRepostCount : content.repostCount} <span className="text-[var(--text-light)]">  {(content.repostCount == 1) ? " republicación" : " republicaciones"} </span>
        </Link>
}


const LikesDetails = ({content, showBsky}: {content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>, showBsky: boolean}) => {

    const url = contentUrl(content.uri) + "/liked-by"

    return <Link className={"text-sm"}
        href={url}
    >
        {showBsky ? content.bskyLikeCount : content.likeCount} <span className="text-[var(--text-light)]"> {" me gusta"} </span>
    </Link>
}


const QuotesDetails = ({content, showBsky}: {content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>, showBsky: boolean}) => {

    const url = contentUrl(content.uri) + "/quoted-by"

    return <Link className={"text-sm"}
                 href={url}
    >
        {showBsky ? content.bskyQuoteCount : content.quoteCount} <span className="text-[var(--text-light)]"> {" citas"} </span>
    </Link>
}
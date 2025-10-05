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

    const handle = content.author.handle

    return <div
        className={"flex items-center exclude-links w-full space-x-3 border-[var(--accent-dark)] px-2"}
    >
        <Details
            count={content.repostCount}
            countBsky={content.bskyRepostCount}
            label={"republicaciones"}
            labelSing={"republicación"}
            showBsky={showBsky}
            url={contentUrl(content.uri, handle) + "/republicaciones"}
        />

        <Details
            count={content.likeCount}
            countBsky={content.bskyLikeCount}
            label={"me gustas"}
            labelSing={"me gusta"}
            showBsky={showBsky}
            url={contentUrl(content.uri, handle) + "/me-gustas"}
        />

        <Details
            count={content.quoteCount}
            countBsky={content.bskyQuoteCount}
            label={"citas"}
            labelSing={"cita"}
            showBsky={showBsky}
            url={contentUrl(content.uri, handle) + "/citas"}
        />
    </div>
}

const Details = ({count, countBsky, label, labelSing, url, showBsky}: {
    count: number
    countBsky: number
    label: string
    labelSing: string
    showBsky: boolean
    url: string
}) => {

    const shownCount = showBsky ? countBsky : count

    if(shownCount == 0) return

    return <Link
        href={url}
        className={"text-[var(--text-light)] hover:text-[var(--text)]"}
    >
        <span className={"text-[var(--text)]"}>{shownCount}</span> <span className="font-light">
            {(shownCount == 1) ? ` ${labelSing}` : ` ${label}`}
        </span>
    </Link>
}
import {contentUrl} from "@/utils/uri";
import {Authorship} from "@/components/feed/frame/content-top-row-author";
import Link from "next/link";
import {ProfileViewBasic} from "@/lex-api/types/app/bsky/actor/defs";


type SelectionQuoteContextProps = {
    quotedContent: string
    quotedContentTitle: string
    quotedContentAuthor: ProfileViewBasic
}


export const SelectionQuoteContext = ({quotedContent, quotedContentTitle, quotedContentAuthor}: SelectionQuoteContextProps) => {
    const title = quotedContentTitle
    const href = contentUrl(quotedContent)

    return (
        <div className={"text-sm text-[var(--text-light)] space-x-1"}>
            <Authorship
                onlyAuthor={true}
                content={{author: quotedContentAuthor}}
            />
            <span>en</span>
            <Link className="font-bold" onClick={(e) => {e.stopPropagation()}} href={href}>
                {title}
            </Link>
        </div>
    )
}
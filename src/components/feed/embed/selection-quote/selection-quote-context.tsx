import {contentUrl, getCollectionFromUri, isArticle, isTopicVersion} from "@/utils/uri";
import Link from "next/link";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {Authorship} from "@/components/feed/frame/authorship";


type SelectionQuoteContextProps = {
    quotedContent: string
    quotedContentTitle: string
    quotedContentAuthor: ProfileViewBasic
}


export const SelectionQuoteContext = ({quotedContent, quotedContentTitle, quotedContentAuthor}: SelectionQuoteContextProps) => {
    const title = quotedContentTitle
    const href = contentUrl(quotedContent)

    const collection = getCollectionFromUri(quotedContent)

    if(isArticle(collection)){
        return (
            <div className={"not-article-content text-sm text-[var(--text-light)] space-x-1"}>
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
    } else if(isTopicVersion(collection)) {
        return (
            <div className={"not-article-content text-sm text-[var(--text-light)] space-x-1"}>
                En tema <Link className="font-bold" onClick={(e) => {e.stopPropagation()}} href={href}>
                    {title}
                </Link>
            </div>
        )
    } else {
        return null
    }
}
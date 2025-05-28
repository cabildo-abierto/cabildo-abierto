import {SelectionQuoteContext} from "@/components/feed/embed/selection-quote/selection-quote-context";
import {SelectionQuoteText} from "@/components/feed/embed/selection-quote/selection-quote-text";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {useRouter} from "next/navigation";
import {contentUrl, getCollectionFromUri, isArticle} from "@/utils/uri";
import {ATProtoStrongRef} from "@/lib/types";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {ArticleEmbed} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {PrettyJSON} from "../../../../../modules/ui-utils/src/pretty-json";

type SelectionQuoteProps = {
    onClick?: (cid: string) => void
    mainPostRef?: ATProtoStrongRef
    showContext?: boolean
    quotedContent: string
    quotedText: string
    quotedContentEmbeds?: ArticleEmbed[]
    quotedContentAuthor: ProfileViewBasic
    quotedTextFormat?: string
    quotedContentTitle?: string
    selection: MarkdownSelection
}

export const SelectionQuote = ({onClick, mainPostRef, showContext=false,
                                   quotedContentTitle, quotedContentEmbeds, quotedContentAuthor, quotedContent, quotedText, quotedTextFormat, selection}: SelectionQuoteProps) => {

    const router = useRouter()

    function handleClick(e) {
        e.preventDefault()
        e.stopPropagation()
        if (onClick) {
            setTimeout(() => {
                onClick(mainPostRef?.cid)
            }, 0);
        } else {
            if(mainPostRef){
                router.push(contentUrl(quotedContent) + "#" + mainPostRef.cid) // TO DO, no anda con temas
            }
        }
    }

    const clickable = onClick != undefined || mainPostRef != null

    const collection = getCollectionFromUri(quotedContent)

    return <div className={"article-content no-margin-first pr-2 " + (isArticle(collection) ? "" : "not-article-content")}>
        <blockquote
            className={"my-1 w-full " + (clickable ? "hover:bg-[var(--background-dark3)] cursor-pointer" : "")}
            onClick={handleClick}
        >
            {showContext && <SelectionQuoteContext
                quotedContent={quotedContent}
                quotedContentAuthor={quotedContentAuthor}
                quotedContentTitle={quotedContentTitle}
            />}
            <SelectionQuoteText
                quotedText={quotedText}
                quotedTextFormat={quotedTextFormat}
                selection={selection}
                quotedTextEmbeds={quotedContentEmbeds}
            />
        </blockquote>
    </div>
}
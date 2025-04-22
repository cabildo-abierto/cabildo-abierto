"use client"
import {SelectionQuoteContext} from "@/components/feed/embed/selection-quote/selection-quote-context";
import {SelectionQuoteText} from "@/components/feed/embed/selection-quote/selection-quote-text";
import {ProfileViewBasic} from "@/lex-api/types/app/bsky/actor/defs";
import {useRouter} from "next/navigation";
import {contentUrl} from "@/utils/uri";
import {ATProtoStrongRef} from "@/lib/types";

type SelectionQuoteProps = {
    onClick?: (cid: string) => void
    mainPostRef?: ATProtoStrongRef
    showContext?: boolean
    quotedContent: string
    quotedText: string
    quotedContentAuthor: ProfileViewBasic
    quotedTextFormat?: string
    quotedContentTitle?: string
    start: number
    end: number
}

export const SelectionQuote = ({onClick, mainPostRef, showContext=false, quotedContentTitle, quotedContentAuthor, quotedContent, quotedText, quotedTextFormat, start, end}: SelectionQuoteProps) => {

    const router = useRouter()

    function handleClick(e) {
        e.stopPropagation()
        e.preventDefault()
        if (onClick) {
            setTimeout(() => {
                onClick(mainPostRef?.uri)
            }, 0);
        } else {
            if(mainPostRef){
                router.push(contentUrl(quotedContent) + "#" + mainPostRef.uri)
            }
        }
    }

    const clickable = onClick != undefined || mainPostRef != null

    return <div className={"article-content no-margin-first pr-2"}>
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
                selection={[start, end]}
            />
        </blockquote>
    </div>
}
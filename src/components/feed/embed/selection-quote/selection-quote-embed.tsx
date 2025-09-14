import {ATProtoStrongRef} from "@/lib/types";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {ArCabildoabiertoEmbedSelectionQuote} from "@/lex-api/index"

type SelectionQuoteEmbedProps = {
    embed: ArCabildoabiertoEmbedSelectionQuote.View
    mainPostRef: ATProtoStrongRef
    onClick?: (cid: string) => void
    showContext?: boolean
}


export default function SelectionQuoteEmbed ({embed, mainPostRef, onClick, showContext = false}: SelectionQuoteEmbedProps) {

    return <SelectionQuote
        {...embed}
        onClick={onClick}
        mainPostRef={mainPostRef}
        showContext={showContext}
        selection={new MarkdownSelection(embed.start, embed.end)}
    />
}
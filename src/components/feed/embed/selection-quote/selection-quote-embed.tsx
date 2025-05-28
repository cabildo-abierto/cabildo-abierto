import {View as EmbedSelectionQuote} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {ATProtoStrongRef} from "@/lib/types";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";


type SelectionQuoteEmbedProps = {
    embed: EmbedSelectionQuote
    mainPostRef: ATProtoStrongRef
    onClick?: (cid: string) => void
    showContext?: boolean
}


export const SelectionQuoteEmbed = ({embed, mainPostRef, onClick, showContext = false}: SelectionQuoteEmbedProps) => {

    return <SelectionQuote
        {...embed}
        onClick={onClick}
        mainPostRef={mainPostRef}
        showContext={showContext}
        selection={new MarkdownSelection(embed.start, embed.end)}
    />
}
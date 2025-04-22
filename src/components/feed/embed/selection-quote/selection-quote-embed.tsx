import {View as EmbedSelectionQuote} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {ATProtoStrongRef} from "@/lib/types";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote";


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
    />
}
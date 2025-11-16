import {ATProtoStrongRef} from "@/lib/types";
import {SelectionQuote} from "./selection-quote";
import {ArCabildoabiertoEmbedSelectionQuote} from "@cabildo-abierto/api"
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";

type SelectionQuoteEmbedProps = {
    embed: ArCabildoabiertoEmbedSelectionQuote.View
    mainPostRef: ATProtoStrongRef
    onClick?: (cid: string) => void
    showContext?: boolean
    editedParent?: boolean
}


export default function SelectionQuoteEmbed({embed, mainPostRef, onClick, showContext = false, editedParent}: SelectionQuoteEmbedProps) {

    return <SelectionQuote
        {...embed}
        onClick={onClick}
        mainPostRef={mainPostRef}
        showContext={showContext}
        selection={new MarkdownSelection(embed.start, embed.end)}
        editedParent={editedParent}
    />
}
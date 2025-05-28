import {useEffect, useState} from "react";
import {
    anyEditorStateToMarkdown, markdownToEditorState
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {View as EmbedSelectionQuote} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {ArticleEmbed} from "@/lex-api/types/ar/cabildoabierto/feed/article";

type QuoteTextProps = {
    quotedText: EmbedSelectionQuote["quotedText"]
    quotedTextFormat: EmbedSelectionQuote["quotedTextFormat"]
    quotedTextEmbeds: ArticleEmbed[]
    selection: MarkdownSelection
}

export const SelectionQuoteText = ({quotedText, quotedTextFormat, quotedTextEmbeds, selection}: QuoteTextProps) => {
    const [initialData, setInitialData] = useState<string>(null)

    useEffect(() => {
        try {
            if(quotedTextFormat != "markdown") return

            const state = markdownToEditorState(quotedText, true, true, quotedTextEmbeds)
            const lexicalSelection = selection.toLexicalSelection(JSON.stringify(state))
            const newInitialData = lexicalSelection.getSelectedSubtree(state)
            const newInitialDataStr = JSON.stringify(newInitialData)
            if(newInitialDataStr != initialData){
                setInitialData(newInitialDataStr)
            }
        } catch (err) {
            console.error("Error: ", err)
        }
    }, [quotedText, quotedTextFormat, selection, initialData, quotedTextEmbeds])

    if(!initialData){
        return null
    }

    return (
        <ReadOnlyEditor
            text={initialData} format={"lexical"}
        />
    )
}

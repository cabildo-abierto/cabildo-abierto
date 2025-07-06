import {useEffect, useMemo, useState} from "react";
import {
    markdownToEditorState
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {View as EmbedSelectionQuote} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {decompress} from "@/utils/compression";
import {initializeEmpty} from "../../../../../modules/ca-lexical-editor/src/lexical-editor";
import {PrettyJSON} from "../../../../../modules/ui-utils/src/pretty-json";

type QuoteTextProps = {
    quotedText: EmbedSelectionQuote["quotedText"]
    quotedTextFormat: EmbedSelectionQuote["quotedTextFormat"]
    quotedTextEmbeds: ArticleEmbedView[]
    selection: MarkdownSelection
}

export const SelectionQuoteText = ({quotedText, quotedTextFormat, quotedTextEmbeds, selection}: QuoteTextProps) => {
    const strSelection = JSON.stringify(selection.toArray())
    const strEmbeds = JSON.stringify(quotedTextEmbeds)
    const content = useMemo(() => {
        if (quotedTextFormat != "markdown" && quotedTextFormat != "markdown-compressed") return null;

        try {
            const markdown = quotedTextFormat == "markdown-compressed" ? decompress(quotedText) : quotedText
            if(quotedText.trim().length == 0){
                return {text: "", format: "markdown"}
            }
            const state = markdownToEditorState(markdown, true, true, quotedTextEmbeds);
            const lexicalSelection = selection.toLexicalSelection(JSON.stringify(state))
            const newInitialData = lexicalSelection.getSelectedSubtree(state)
            return {text: JSON.stringify(newInitialData), format: "lexical"}
        } catch (err) {
            console.error("Error generating initialData:", err);
            return null;
        }
    }, [
        quotedText,
        quotedTextFormat,
        strSelection,
        strEmbeds
    ]);

    if(!content){
        return null
    }

    return (
        <ReadOnlyEditor text={content.text} format={content.format}/>
    )
}

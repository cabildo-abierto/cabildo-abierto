import {useEffect, useMemo, useState} from "react";
import {
    markdownToEditorState
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {View as EmbedSelectionQuote} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {decompress} from "@/utils/compression";

type QuoteTextProps = {
    quotedText: EmbedSelectionQuote["quotedText"]
    quotedTextFormat: EmbedSelectionQuote["quotedTextFormat"]
    quotedTextEmbeds: ArticleEmbedView[]
    selection: MarkdownSelection
}

export const SelectionQuoteText = ({quotedText, quotedTextFormat, quotedTextEmbeds, selection}: QuoteTextProps) => {
    const strSelection = JSON.stringify(selection.toArray())
    const strEmbeds = JSON.stringify(quotedTextEmbeds)
    const initialData = useMemo(() => {
        if (quotedTextFormat != "markdown" && quotedTextFormat != "markdown-compressed") return null;

        try {
            const markdown = quotedTextFormat == "markdown-compressed" ? decompress(quotedText) : quotedText
            const state = markdownToEditorState(markdown, true, true, quotedTextEmbeds);
            const lexicalSelection = selection.toLexicalSelection(JSON.stringify(state));
            const newInitialData = lexicalSelection.getSelectedSubtree(state);
            return JSON.stringify(newInitialData);
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

    if(!initialData){
        return null
    }

    return (
        <ReadOnlyEditor
            text={initialData} format={"lexical"}
        />
    )
}

import React, {useMemo} from "react";
import {
    markdownToEditorState
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {decompress} from "@/utils/compression";
import {getEditorSettings} from "@/components/writing/settings";
import {isArticle} from "@/utils/uri";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoEmbedSelectionQuote} from "@/lex-api/index"
import MyLexicalEditor from '../../../../../modules/ca-lexical-editor/src/lexical-editor'
import {robotoSerif} from "@/components/writing/article-font";


type QuoteTextProps = {
    quotedText: ArCabildoabiertoEmbedSelectionQuote.View["quotedText"]
    quotedTextFormat: ArCabildoabiertoEmbedSelectionQuote.View["quotedTextFormat"]
    quotedTextEmbeds: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    selection: MarkdownSelection
    quotedCollection: string
}

export const SelectionQuoteText = ({quotedText, quotedTextFormat, quotedTextEmbeds, selection, quotedCollection}: QuoteTextProps) => {
    const strSelection = JSON.stringify(selection.toArray())
    const strEmbeds = JSON.stringify(quotedTextEmbeds)
    const content = useMemo(() => {
        if (quotedTextFormat != "markdown" && quotedTextFormat != "markdown-compressed") return null;

        try {
            const markdown = quotedTextFormat == "markdown-compressed" ? decompress(quotedText) : quotedText
            if(quotedText.trim().length == 0){
                return {text: "", format: "markdown"}
            }
            const state = markdownToEditorState(
                markdown, true, true, quotedTextEmbeds
            );
            const lexicalSelection = selection.toLexicalSelection(state)
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

    const settings = getEditorSettings({
        initialTextFormat: content.format,
        initialText: content.text,
        isReadOnly: true,
        allowComments: false,
        tableOfContents: false,
        editorClassName: isArticle(quotedCollection) ? `article-content ${robotoSerif.variable}` : `article-content not-article-content`,
        embeds: quotedTextEmbeds,
        topicMentions: false
    })

    return (
        <div>
            <MyLexicalEditor
                settings={settings}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    )
}

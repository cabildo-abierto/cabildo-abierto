import React, {useMemo} from "react";
import {getEditorSettings} from "../../../writing/settings";
import {isArticle} from "@cabildo-abierto/utils";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoEmbedSelectionQuote} from "@cabildo-abierto/api"
import {CAEditor} from '@/components/editor'
import {robotoSerif} from "../../../writing/article-font";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {markdownToEditorState} from "../../../editor/markdown-transforms";
import { decompress } from "@cabildo-abierto/editor-core";


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
            <CAEditor
                settings={settings}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    )
}

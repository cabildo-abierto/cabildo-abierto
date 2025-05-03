"use client"
import {useEffect, useState} from "react";
import {decompress} from "@/utils/compression";
import {
    anyEditorStateToMarkdown, editorStateToMarkdown,
    markdownToEditorStateStr
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {markdownSelectionToLexicalSelection} from "../../../../../modules/ca-lexical-editor/src/selection-transforms";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {View as EmbedSelectionQuote} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote";
import {getSelectionFromJSONState} from "../../../../../modules/ca-lexical-editor/src/editor-state-utils";

type QuoteTextProps = {
    quotedText: EmbedSelectionQuote["quotedText"]
    quotedTextFormat: EmbedSelectionQuote["quotedTextFormat"]
    selection: [number, number]
}

export const SelectionQuoteText = ({quotedText, quotedTextFormat, selection}: QuoteTextProps) => {
    const [initialData, setInitialData] = useState<string>(null)

    useEffect(() => {
        // tengo contenido y seleccion en markdown
        // transformo a markdown
        // transformo a editor state
        // convierto seleccion a lexical selection
        // recorto segun esa seleccion
        // seteo esa initial data
        const markdown = anyEditorStateToMarkdown(quotedText, quotedTextFormat)

        const state = markdownToEditorStateStr(markdown)
        const lexicalQuote = markdownSelectionToLexicalSelection(state, selection)
        const newInitialData = getSelectionFromJSONState(JSON.parse(state), lexicalQuote)

        if(newInitialData != initialData){
            setInitialData(newInitialData)
        }
    }, [quotedText, quotedTextFormat, selection, initialData])

    if(!initialData){
        return null
    }

    return (
        <ReadOnlyEditor
            text={initialData} format={"lexical"}
        />
    )
}

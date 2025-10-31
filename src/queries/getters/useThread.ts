import {isFullArticleView, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {threadApiUrl} from "@/utils/uri";
import {decompress} from "@/utils/compression";
import {useEffect, useState} from "react";
import { useAPI } from "../utils";



export function threadQueryKey(uri: string){
    return ["thread", uri]
}


export const useThreadWithNormalizedContent = (uri: string) => {
    const res = useAPI<ThreadViewContent>(threadApiUrl(uri), threadQueryKey(uri))
    const [newContent, setNewContent] = useState<ThreadViewContent | null | "loading">("loading")

    useEffect(() => {
        async function process() {
            const content = res.data

            if(isFullArticleView(content.content)){
                let newText: string
                if(content.content.format == "markdown-compressed"){
                    newText = decompress(content.content.text)
                } else if(content.content.format == "markdown"){
                    newText = content.content.text
                } else {
                    setNewContent(content)
                }

                const { markdownToEditorState, normalizeMarkdown, editorStateToMarkdown } = await import("../../../modules/ca-lexical-editor/src/markdown-transforms")

                const state = markdownToEditorState(
                    newText, true, true, content.content.embeds)
                const markdown = editorStateToMarkdown(state)

                setNewContent({
                    ...content,
                    content: {
                        ...content.content,
                        text: normalizeMarkdown(markdown.markdown, true),
                        embeds: markdown.embeds,
                        format: "markdown"
                    }
                })
            } else {
                setNewContent(content)
            }
        }
        if(res.data){
            process()
        } else if(res.isError || !res.isLoading){
            setNewContent(null)
        }
    }, [res.data])


    return {query: res, thread: newContent}
}
import {useEffect, useState} from "react";
import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {decompress} from "@cabildo-abierto/editor-core";
import {threadApiUrl} from "@/components/utils/react/url";


export function threadQueryKey(uri: string) {
    return ["thread", uri]
}


export const useThreadWithNormalizedContent = (uri: string) => {
    const res = useAPI<ArCabildoabiertoFeedDefs.ThreadViewContent>(threadApiUrl(uri), threadQueryKey(uri))
    const [newContent, setNewContent] = useState<ArCabildoabiertoFeedDefs.ThreadViewContent | null | "loading">("loading")

    useEffect(() => {
        async function process() {
            const content = res.data

            if (ArCabildoabiertoFeedDefs.isFullArticleView(content.content)) {
                let newText: string
                if (content.content.format == "markdown-compressed") {
                    newText = decompress(content.content.text)
                } else if (content.content.format == "markdown") {
                    newText = content.content.text
                } else {
                    setNewContent(content)
                }

                const {
                    markdownToEditorState,
                    normalizeMarkdown,
                    editorStateToMarkdown
                } = await import("@/components/editor/markdown-transforms")

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

        if (res.data) {
            process()
        } else if (res.isError || !res.isLoading) {
            setNewContent(null)
        }
    }, [res.data])

    return {query: res, thread: newContent, refetch: res.refetch}
}
"use client"
import {ArticleProps, ReasonProps} from '@/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {decompress} from "@/utils/compression";
import {getAllText} from "@/components/topics/topic/diff";
import ReadOnlyEditor from "@/components/editor/read-only-editor";


export type ArticlePreviewProps = {
    elem: ArticleProps & ReasonProps
    repostedBy?: {displayName?: string, handle: string}
    showingChildren?: boolean
}


export const ArticlePreview = (
    {elem, showingChildren=false}: ArticlePreviewProps
) => {

    let summary: {text: string, format: string}
    if(elem.content.format == "markdown"){
        summary = {text: elem.content.text.slice(0, 150), format: "markdown"}
    } else if(!elem.content.format || elem.content.format == "lexical-compressed"){
        const summaryJson = JSON.parse(decompress(elem.content.text))
        summary = {text: getAllText(summaryJson.root).slice(0, 150), format: "plain-text"}
    } else {
        return <div className={"py-4 text-[var(--text-light)]"}>
            Ocurrió un error al generar la previsualización del artículo.
        </div>
    }

    return <FastPostPreviewFrame post={elem} borderBelow={!showingChildren} showingChildren={showingChildren}>
        <div className={"border rounded-lg p-2 my-2 hover:bg-[var(--background-dark2)]"}>
            <div className={"text-sm text-[var(--text-light)]"}>
                Artículo
            </div>
            <div className={"font-bold text-lg pb-1"}>
                {elem.content.article.title}
            </div>

            <div className={"border-t pt-1 text-sm text-[var(--text-light)] article-preview-content"}>
                <ReadOnlyEditor text={summary.text+"..."} format={summary.format}/>
            </div>
        </div>
    </FastPostPreviewFrame>
}
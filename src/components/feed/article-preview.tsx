"use client"
import {ArticleProps, ReasonProps} from '../../app/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {decompress} from "../compression";
import {getAllText} from "../diff";
import {RepostedBy} from "./reposted-by";


export type ArticlePreviewProps = {
    elem: ArticleProps & ReasonProps
    repostedBy?: {displayName?: string, handle: string}
    showingChildren?: boolean
}


export const ArticlePreview = (
    {elem, showingChildren=false}: ArticlePreviewProps
) => {

    const summaryJson = JSON.parse(decompress(elem.content.text))
    const summary = getAllText(summaryJson.root).slice(0, 150)

    return <FastPostPreviewFrame post={elem} borderBelow={!showingChildren} showingChildren={showingChildren}>
        <div className={"border rounded-lg p-2 my-2 hover:bg-[var(--background-dark2)]"}>
            <div className={"font-bold text-lg"}>
                {elem.content.article.title}
            </div>

            <div className={"border-t pt-1"}>
                {summary}...
            </div>
        </div>
    </FastPostPreviewFrame>
}
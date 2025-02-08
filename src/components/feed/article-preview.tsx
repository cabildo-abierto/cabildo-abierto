"use client"
import {ArticleProps} from '../../app/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {decompress} from "../compression";
import {getAllText} from "../diff";


export type ArticlePreviewProps = {
    elem: ArticleProps,
    borderBelow?: boolean
}


export const ArticlePreview = (
    {elem, borderBelow=true}: ArticlePreviewProps
) => {

    const summaryJson = JSON.parse(decompress(elem.content.text))
    const summary = getAllText(summaryJson.root).slice(0, 150)

    return <div className="flex w-full">
        <FastPostPreviewFrame post={elem} borderBelow={borderBelow}>
            <div className={"border rounded-lg p-2 my-2 hover:bg-[var(--background-dark2)]"}>
                <div className={"font-bold text-lg"}>
                    {elem.content.article.title}
                </div>

                <div className={"border-t pt-1"}>
                    {summary}...
                </div>
            </div>
        </FastPostPreviewFrame>
    </div>
}
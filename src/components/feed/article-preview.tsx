"use client"
import {ArticleProps} from '../../app/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {PostTitleOnFeed} from "./post-title-on-feed";
import {ContentOptions} from "../content-options/content-options";
import {useUser} from "../../hooks/user";

export type ArticlePreviewProps = {
    elem: ArticleProps
    borderBelow?: boolean
}


export const ArticlePreview = (
    {elem, borderBelow=true}: ArticlePreviewProps
) => {
    
    return <div className="flex w-full">
        <FastPostPreviewFrame post={elem} borderBelow={borderBelow}>
            <PostTitleOnFeed title={elem.content.article.title}/>
        </FastPostPreviewFrame>
    </div>
}
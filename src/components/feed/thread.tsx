"use client"
import { FastPost } from "./fast-post"
import {ArticleProps, DatasetProps, FastPostProps, ThreadProps, VisualizationProps} from "../../app/lib/definitions"
import { ReplyButton } from "./reply-button"
import { FastPostPreview } from "./fast-post-preview"
import {useState} from "react";
import {WritePanel} from "../writing/write-panel";
import {Article} from "./article";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {useLayoutConfig} from "../layout/layout-config-context";
import {VisualizationOnThread} from "../visualizations/visualization-on-thread";
import {DatasetOnThread} from "../datasets/dataset-on-thread";


export const Thread = ({thread}: {thread: ThreadProps}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState([])
    const {layoutConfig} = useLayoutConfig()

    const replies = thread.replies

    let quoteReplies = []
    if(thread.post.collection == "ar.com.cabildoabierto.article"){
        if(thread.post.collection == "ar.com.cabildoabierto.article"){
            quoteReplies = replies.filter((r) => (r.content.post.quote != undefined))
        }
    }

    return <div className={"flex flex-col items-center"}>
        {(thread.post.collection == "app.bsky.feed.post" || thread.post.collection == "ar.com.cabildoabierto.quotePost") && <FastPost
            post={thread.post as FastPostProps}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.article" && <Article
            content={thread.post as ArticleProps}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.visualization" && <VisualizationOnThread
            visualization={thread.post as VisualizationProps}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.dataset" && <DatasetOnThread
            dataset={thread.post as DatasetProps}
        />}
        <div className={"w-full"}>
            <ReplyButton onClick={() => {setOpenReplyPanel(true)}}/>
        </div>
        <div className={"w-[600px] mb-32 " + (layoutConfig.maxWidthCenter != "600px" ? "mt-20 border-t" : "")}>
            {replies.map((r, index) => {

                function onClickQuote(){
                    setPinnedReplies([...pinnedReplies, r.cid])
                    const elem = document.getElementById(r.cid)
                    smoothScrollTo(elem)
                }

                return <div key={index}>
                    <FastPostPreview
                        post={r}
                        parentIsMainPost={true}
                        onClickQuote={onClickQuote}
                    />
                </div>
            })}
            {replies.length == 0 && <div className={"text-center text-[var(--text-light)] pt-4 pb-8"}>
                Todavía no hubo ninguna respuesta.
            </div>}
        </div>

        <WritePanel
            replyTo={thread.post}
            open={openReplyPanel}
            onClose={() => {setOpenReplyPanel(false)}}
        />
    </div>
}
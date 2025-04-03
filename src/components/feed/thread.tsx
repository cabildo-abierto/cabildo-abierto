"use client"
import { FastPost } from "./fast-post"
import {ArticleProps, DatasetProps, FastPostProps, ThreadProps, VisualizationProps} from "@/lib/definitions"
import { ReplyButton } from "./reply-button"
import { FastPostPreview } from "./fast-post-preview"
import {useEffect, useState} from "react";
import {WritePanel} from "../writing/write-panel";
import {Article} from "../article/article";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {VisualizationOnThread} from "../visualizations/visualization-on-thread";
import {DatasetOnThread} from "../datasets/dataset-on-thread";

import {collectionToDisplay, isPost, threadApiUrl} from "../../utils/uri";
import {useSWRConfig} from "swr";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {useRouter} from "next/navigation";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";


export const ThreadHeader = ({c, title}: {c?: string, title?: string}) => {
    return <div className={"flex space-x-4 items-center w-full px-2 py-2"}>
        <div className={""}>
            <BackButton defaultURL={"/"}/>
        </div>
        <div className={"font-bold text-lg"}>
            {c ? collectionToDisplay(c) : title}
        </div>
    </div>
}


export const Thread = ({thread}: {thread: ThreadProps}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState([])
    const [quoteReplies, setQuoteReplies] = useState([])
    const {mutate} = useSWRConfig()

    const replies = thread.replies

    useEffect(() => {
        if(thread.post.collection == "ar.com.cabildoabierto.article"){
            if(thread.post.collection == "ar.com.cabildoabierto.article"){
                setQuoteReplies(thread.replies.filter((r) => (r.content.post.quote != undefined)))
            }
        }
    }, [thread])

    return <div className={"flex flex-col items-center"}>
        <ThreadHeader c={thread.post.collection}/>
        {isPost(thread.post.collection) && <FastPost
            post={thread.post as FastPostProps}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.article" && <Article
            article={thread.post as ArticleProps}
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
        <div className={"w-full mb-32"}>
            {!replies && <div className={"py-4"}>
                <LoadingSpinner/>
            </div>}
            {replies && replies.map((r, index) => {

                function onClickQuote(){
                    setPinnedReplies([...pinnedReplies, r.cid])
                    const elem = document.getElementById(r.cid)
                    smoothScrollTo(elem)
                }

                return <div key={index} className={"w-full"}>
                    <FastPostPreview
                        post={r}
                        parentIsMainPost={true}
                        onClickQuote={onClickQuote}
                        onDeleteFeedElem={async () => {}}
                    />
                </div>
            })}
            {replies && replies.length == 0 && <div className={"text-center text-[var(--text-light)] pt-4 pb-8"}>
                Todavía no hubo ninguna respuesta.
            </div>}
        </div>

        <WritePanel
            replyTo={thread.post}
            open={openReplyPanel}
            onClose={() => {setOpenReplyPanel(false)}}
            onSubmit={async () => {
                mutate(threadApiUrl(thread.post.uri))
            }}
        />
    </div>
}
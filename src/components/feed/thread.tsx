"use client"
import { FastPost } from "./fast-post"
import {ArticleProps, DatasetProps, FastPostProps, ThreadProps, VisualizationProps} from "../../app/lib/definitions"
import { ReplyButton } from "./reply-button"
import { FastPostPreview } from "./fast-post-preview"
import {useEffect, useState} from "react";
import {WritePanel} from "../write-panel";
import {Article} from "./article";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {decompress} from "../compression";
import {QuoteDirProps} from "../editor/plugins/CommentPlugin/show-quote-reply";
import {useLayoutConfig} from "../layout/layout-config-context";
import {Visualization} from "../visualizations/visualization";
import {DatasetOnThread} from "../datasets/dataset-on-thread";


function validQuotePointer(indexes: number[], node: any){
    if(indexes.length == 0){
        return true
    }

    if(!node.children) return false
    if(indexes[0] > node.children.length) return false
    return validQuotePointer(indexes.slice(1), node.children[indexes[0]])
}


export function validQuotePost(content: {text?: string, format?: string}, r: FastPostProps){
    if(!content.text) return false
    if(content.format == "markdown") return false // TO DO

    try {

        const quote: QuoteDirProps = JSON.parse(r.content.post.quote)

        const jsonContent = JSON.parse(decompress(content.text))

        if(!validQuotePointer(quote.start.node, jsonContent.root)) return false
        if(!validQuotePointer(quote.end.node, jsonContent.root)) return false
        return true
    } catch (e) {
        console.log("error validating quote")
        console.log(r.content.post.quote)
        console.log(e)
        return false
    }
}


export const Thread = ({thread}: {thread: ThreadProps}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState([])
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    useEffect(() => {
        if(thread.post.collection == "ar.com.cabildoabierto.article"){
            if(!layoutConfig.distractionFree){
                setLayoutConfig({...layoutConfig, distractionFree: true, maxWidthCenter: "800px"})
            }
        }
    }, [])

    const text = thread.post.collection == "ar.com.cabildoabierto.article" ? (thread.post as ArticleProps).content : undefined

    const replies = thread.replies.filter((r) => {return !r.content.post.quote || validQuotePost(text, r)})

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
        {thread.post.collection == "ar.com.cabildoabierto.visualization" && <Visualization
            visualization={thread.post as VisualizationProps}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.dataset" && <DatasetOnThread
            dataset={thread.post as DatasetProps}
        />}
        <div className={"w-[600px] border-l border-r"}>
            <ReplyButton onClick={() => {setOpenReplyPanel(true)}}/>
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
            {replies.length == 0 && <div className={"text-center text-[var(--text-light)] pt-4 pb-8"}>Todavía no hubo ninguna respuesta.</div>}
        </div>

        <WritePanel
            replyTo={thread.post}
            open={openReplyPanel}
            onClose={() => {setOpenReplyPanel(false)}}
        />
    </div>
}
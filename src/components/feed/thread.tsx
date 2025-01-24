"use client"
import { FastPost } from "./fast-post"
import {ArticleProps, FastPostProps, ThreadProps} from "../../app/lib/definitions"
import { ReplyButton } from "./reply-button"
import { FastPostPreview } from "./fast-post-preview"
import {useEffect, useState} from "react";
import {WritePanel} from "../write-panel";
import {Article} from "./article";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {decompress} from "../compression";
import {QuoteDirProps} from "../editor/plugins/CommentPlugin/show-quote-reply";
import {useLayoutConfig} from "../layout/layout-config-context";


function validQuotePointer(indexes: number[], node: any){
    if(indexes.length == 0){
        return true
    }

    if(!node.children) return false
    if(indexes[0] > node.children.length) return false
    return validQuotePointer(indexes.slice(1), node.children[indexes[0]])
}


export function validQuotePost(compressedText: string, r: FastPostProps){
    try {

        const quote: QuoteDirProps = JSON.parse(r.content.post.quote)

        const content = JSON.parse(decompress(compressedText))

        if(!validQuotePointer(quote.start.node, content.root)) return false
        if(!validQuotePointer(quote.end.node, content.root)) return false
        return true
    } catch (e) {
        console.log("error validating quote")
        console.log(r.content.post.quote)
        console.log(decompress(compressedText))
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
            if(layoutConfig.distractionFree == false){
                setLayoutConfig({distractionFree: true})
            }
        }
    }, [])

    const replies = thread.replies.filter((r) => {return validQuotePost(thread.post.content.text, r)})

    let quoteReplies = undefined
    if(thread.post.collection == "ar.com.cabildoabierto.article"){
        quoteReplies = replies.filter((r) => (r.content.post.quote != undefined))
    }

    return <div>
        {thread.post.collection == "app.bsky.feed.post" && <FastPost
            content={thread.post as FastPostProps}
        />}
        {thread.post.collection == "ar.com.cabildoabierto.article" && <Article
            content={thread.post as ArticleProps}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />}
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
                    showParent={false}
                    parentIsMainPost={true}
                    onClickQuote={onClickQuote}
                />
            </div>
        })}
        <WritePanel replyTo={thread.post} open={openReplyPanel} onClose={() => {setOpenReplyPanel(false)}}/>
    </div>
}
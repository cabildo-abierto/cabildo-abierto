"use client"
import { FastPost } from "./fast-post"
import {ArticleProps, FastPostProps, ThreadProps} from "../../app/lib/definitions"
import { ReplyButton } from "./reply-button"
import { FastPostPreview } from "./fast-post-preview"
import {useState} from "react";
import {WritePanel} from "../write-panel";
import {Article} from "./article";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";
import {decompress} from "../compression";
import {QuoteDirProps} from "../editor/plugins/CommentPlugin/show-quote-reply";


function validQuotePointer(indexes: number[], node: any){
    if(indexes.length == 0){
        return true
    }

    if(!node.children) return false
    if(indexes[0] > node.children.length) return false
    return validQuotePointer(indexes.slice(1), node.children[indexes[0]])
}


function validQuotePost(post: ArticleProps, r: FastPostProps){
    const quote: QuoteDirProps = JSON.parse(r.content.post.quote)

    const content = JSON.parse(decompress(post.content.text))

    if(!validQuotePointer(quote.start.node, content.root)) return false
    if(!validQuotePointer(quote.end.node, content.root)) return false
    return true
}


export const Thread = ({thread}: {thread: ThreadProps}) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState([])

    const replies = thread.replies.filter((r) => {return validQuotePost(thread.post as ArticleProps, r)})

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
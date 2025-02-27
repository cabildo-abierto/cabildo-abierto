import {decompress} from "../compression";
import ReadOnlyEditor from "../editor/read-only-editor";
import {contentUrl, getCollectionFromUri} from "../utils";
import {Authorship} from "../content-top-row-author";
import {getTopicTitle} from "../topic/utils";
import Link from "next/link";
import {useRouter} from "next/navigation";
import "../editor/article-content.css"
import { useQuotedContent } from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";


function filterOutsideSelection(node: any, start: number[] | undefined, startOffset: number | undefined, end: number[] | undefined, endOffset: number | undefined){
    if(!node.children) {
        if(startOffset != undefined && endOffset != undefined){
            node.text = node.text.slice(startOffset, endOffset)
        } else if(startOffset != undefined){
            node.text = node.text.slice(startOffset)
        } else if(endOffset != undefined){
            node.text = node.text.slice(0, endOffset)
        }
        return node
    }
    if(!start && !end) return node

    const newChildren = []
    for(let i = 0; i < node.children.length; i++){
        if(start && i < start[0]) continue
        else if(end && i > end[0]) continue

        let c
        if(start && i == start[0] && end && i == end[0]){
            c = filterOutsideSelection(node.children[i], start.slice(1), startOffset, end.slice(1), endOffset)
        } else if(start && i == start[0]){
            c = filterOutsideSelection(node.children[i], start.slice(1), startOffset, undefined, undefined)
        } else if(end && i == end[0]){
            c = filterOutsideSelection(node.children[i], undefined, undefined, end.slice(1), endOffset)
        } else {
            c = node.children[i]
        }
        newChildren.push(c)
    }

    node.children = newChildren

    return node
}


function getSelectionFromJSONState(state: any, selection: {start: {node: number[], offset: number}, end: {node: number[], offset:number}}){
    return JSON.stringify({
        root: filterOutsideSelection(state.root, selection.start.node, selection.start.offset, selection.end.node, selection.end.offset)
    })
}

const ArticleQuote = ({quoteStr, quotedContent}: {quoteStr: string, quotedContent: QuotedContent}) => {
    const quote = JSON.parse(quoteStr)
    const parentContent = JSON.parse(decompress(quotedContent.content.text))

    const initialData = getSelectionFromJSONState(parentContent, quote)

    return <ReadOnlyEditor
        initialData={initialData}
    />
}


const TopicQuote = ({quoteStr, quotedContent}: {quoteStr: string, quotedContent: QuotedContent}) => {
    const quote = JSON.parse(quoteStr)

    let initialData
    if(!quotedContent.content.format || quotedContent.content.format == "lexical-compressed"){
        const parentContent = JSON.parse(decompress(quotedContent.content.text))
        initialData = getSelectionFromJSONState(parentContent, quote)
    } else if(quotedContent.content.format == "markdown"){
        throw Error("Markdown comments not implemented.")
    } else {
        throw Error(quotedContent.content.format + " comments not implemented.")
    }

    return <ReadOnlyEditor
        initialData={initialData}
    />
}


export type QuotedContent = {
    uri?: string
    author: {
        displayName?: string
        handle: string
    }
    content?: {
        text?: string
        format?: string
        article?: {
            title: string
        }
        topicVersion?: {
            topic: {
                id: string
                versions: {
                    title?: string
                }[]
            }
        }
    }
}


const ContentQuoteWithNoContent = ({
   post, quote, onClick, showContext=false
}: {
    quote?: string
    post?: {cid?: string, content: {post: {replyTo?: {uri: string}}}}
    onClick?: () => void
    showContext?: boolean
}) => {
    const {quotedContent} = useQuotedContent(post.content.post.replyTo.uri)

    if(!quotedContent){
        return <div className={"py-4"}>
            <LoadingSpinner/>
        </div>
    }
    return <ContentQuote
        post={post}
        quote={quote}
        onClick={onClick}
        showContext={showContext}
        quotedContent={quotedContent}
    />
}


export const ContentQuote = ({
    post, quote, onClick, quotedContent, showContext=false}: {
    quotedContent: QuotedContent
    quote?: string
    post?: {cid?: string, content: {post: {replyTo?: {uri: string}}}}
    onClick?: () => void
    showContext?: boolean
}) => {
    const router = useRouter()

    if(!quote){
        return null
    }

    if(!quotedContent.content && post.content.post.replyTo){
        return <ContentQuoteWithNoContent
            post={post}
            quote={quote}
            onClick={onClick}
            showContext={showContext}
        />
    }

    const collection = getCollectionFromUri(quotedContent.uri)
    const center = collection == "ar.com.cabildoabierto.article" ?
        <ArticleQuote quoteStr={quote} quotedContent={quotedContent}/> : <TopicQuote quoteStr={quote} quotedContent={quotedContent}/>

    function handleClick(e) {
        e.stopPropagation()
        e.preventDefault()
        if(onClick){
            onClick()
        } else {
            if(post){
                router.push(contentUrl(quotedContent.uri)+"#"+post.cid)
            }
        }
    }

    let context = null
    if(showContext){
        const kind = collection == "ar.com.cabildoabierto.article" ? "artículo" : "tema"

        const title = kind == "artículo" ?
            quotedContent.content.article.title : getTopicTitle(quotedContent.content.topicVersion.topic)

        const href = contentUrl(quotedContent.uri, quotedContent.author.handle)

        context = <div className={"text-sm text-[var(--text-light)]"}>
            <Authorship onlyAuthor={true} content={quotedContent}/> en <Link className="font-bold" onClick={(e) => {e.stopPropagation()}} href={href}>{title}</Link>
        </div>
    }

    const clickable = onClick != undefined || (post && post.cid)

    return <div className={"article-content no-margin-first"}>
        <blockquote
            className={"my-1 " + (clickable ? "hover:bg-[var(--background-dark3)] cursor-pointer" : "")}
            onClick={handleClick}
        >
            {context}
            {center}
        </blockquote>
    </div>
}
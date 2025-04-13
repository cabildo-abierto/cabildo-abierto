"use client"
import {decompress} from "@/utils/compression";
import ReadOnlyEditor from "../editor/read-only-editor";
import {Authorship} from "./content-top-row-author";
import {getTopicTitle} from "@/components/topics/topic/utils";
import Link from "next/link";
import {useRouter} from "next/navigation";
import { useQuotedContent } from "@/hooks/swr";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {contentUrl, getCollectionFromUri} from "@/utils/uri";
import {markdownSelectionToLexicalSelection} from "../../../modules/ca-lexical-editor/src/selection-transforms";
import {
    LexicalStandardSelection
} from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin/standard-selection";
import {markdownToEditorStateStr} from "../../../modules/ca-lexical-editor/src/markdown-transforms";
import {getAllText} from "@/components/topics/topic/diff";
import {useEffect, useState} from "react";
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";


export function getSelectionSubtree(s: any, selection: LexicalStandardSelection) {
    const copy = JSON.parse(JSON.stringify(s))
    try {
        return {
            root: filterOutsideSelection(copy.root, selection.start.node, selection.start.offset, selection.end.node, selection.end.offset)
        }
    } catch (err) {
        console.log("Error filtering outside selection:")
        console.log(selection)
        console.log(getAllText(copy.root))
        return s
    }
}


export function filterOutsideSelection(node: any, start: number[] | undefined, startOffset: number | undefined, end: number[] | undefined, endOffset: number | undefined){
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


function getSelectionFromJSONState(state: any, selection: LexicalStandardSelection){
    return JSON.stringify({
        root: filterOutsideSelection(state.root, selection.start.node, selection.start.offset, selection.end.node, selection.end.offset)
    })
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
                versions?: {
                    title?: string
                }[]
            }
        }
    }
}


const ContentQuoteWithNoContent = ({
   post, quote, onClick, showContext=false
}: {
    quote?: [number, number]
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
    if(!quotedContent.content.text){
        console.error("quotedContent", quotedContent)
        return <div>
            Error
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


type ContentQuoteContextProps = {
    quotedContent: QuotedContent
}


const ContentQuoteContext = ({quotedContent}: ContentQuoteContextProps) => {
    const c = getCollectionFromUri(quotedContent.uri)
    const kind = c == "ar.com.cabildoabierto.article" ? "artículo" : "tema"

    const title = kind == "artículo" ?
        quotedContent.content.article.title : getTopicTitle(quotedContent.content.topicVersion.topic as any)

    const href = contentUrl(quotedContent.uri)

    return (
        <div className={"text-sm text-[var(--text-light)]"}>
            <Authorship onlyAuthor={true} content={quotedContent}/> en <Link className="font-bold" onClick={(e) => {e.stopPropagation()}} href={href}>{title}</Link>
        </div>
    )
}

type QuoteTextProps = {
    quotedContent: QuotedContent
    quote: [number, number]
}

export const QuoteText = ({quotedContent, quote}: QuoteTextProps) => {
    const [initialData, setInitialData] = useState<string>(null)

    useEffect(() => {
        let markdown: string
        if(quotedContent.content.format == "markdown-compressed") {
            markdown = decompress(quotedContent.content.text)
        } else if(quotedContent.content.format == "markdown"){
            markdown = quotedContent.content.text
        } else {
            return null
        }

        const state = markdownToEditorStateStr(markdown)
        const lexicalQuote = markdownSelectionToLexicalSelection(state, quote)
        const newInitialData = getSelectionFromJSONState(JSON.parse(state), lexicalQuote)

        if(newInitialData != initialData){
            setInitialData(newInitialData)
        }
    }, [quotedContent, quote])

    if(!initialData){
        return null
    }

    return (
        <ReadOnlyEditor
            text={initialData} format={"lexical"}
        />
    )
}


export const ContentQuote = ({
    post, quote, onClick, quotedContent, showContext=false}: {
    quotedContent: QuotedContent
    quote?: [number, number]
    post?: {cid?: string, content: {post: {replyTo?: {uri: string}}}}
    onClick?: () => void
    showContext?: boolean
}) => {
    const router = useRouter()

    if(!quote){
        return null
    }

    if((!quotedContent.content || !quotedContent.content.text) && post.content.post.replyTo){
        return <ContentQuoteWithNoContent
            post={post}
            quote={quote}
            onClick={onClick}
            showContext={showContext}
        />
    }

    if(!quotedContent || !quotedContent.content.text) return null

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

    const clickable = onClick != undefined || (post && post.cid)

    return <div className={"article-content no-margin-first pr-2"}>
        <blockquote
            className={"my-1 w-full " + (clickable ? "hover:bg-[var(--background-dark3)] cursor-pointer" : "")}
            onClick={handleClick}
        >
            {showContext && <ContentQuoteContext quotedContent={quotedContent}/>}
            <QuoteText quotedContent={quotedContent} quote={quote}/>
        </blockquote>
    </div>
}
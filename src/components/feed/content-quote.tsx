import {
    ArticleProps,
    FastPostProps,
    FeedContentPropsNoRepost, RecordProps,
    TopicVersionOnFeedProps
} from "../../app/lib/definitions";
import {useArticle} from "../../hooks/user";
import {decompress} from "../compression";
import ReadOnlyEditor from "../editor/read-only-editor";
import {contentUrl, getCollectionFromUri} from "../utils";
import {useTopic, useTopicVersion} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";
import {Authorship} from "../content-top-row-author";
import {getTopicTitle} from "../topic/utils";
import Link from "next/link";
import {useRouter} from "next/navigation";


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

const ArticleQuote = ({post}: {post: FastPostProps}) => {
    const quoteStr = post.content.post.quote
    const parent = useArticle(post.content.post.replyTo.uri)

    if(!parent.article){
        return <LoadingSpinner size={"20px"}/>
    }

    const quote = JSON.parse(quoteStr)
    const parentContent = JSON.parse(decompress(parent.article.content.text))

    const initialData = getSelectionFromJSONState(parentContent, quote)

    return <ReadOnlyEditor
        initialData={initialData}
    />
}


const TopicQuote = ({post}: {post: FastPostProps}) => {
    const quoteStr = post.content.post.quote
    const parent = useTopicVersion(post.content.post.replyTo.uri)

    if(!parent.topic){
        return <LoadingSpinner size={"20px"}/>
    }

    const quote = JSON.parse(quoteStr)

    let initialData
    if(parent.topic.content.format == "lexical-compressed"){
        const parentContent = JSON.parse(decompress(parent.topic.content.text))
        initialData = getSelectionFromJSONState(parentContent, quote)
    } else if(parent.topic.content.format == "markdown"){
        throw Error("Not implemented")
    } else {
        throw Error("Not implemented")
    }

    return <ReadOnlyEditor
        initialData={initialData}
    />
}


export const ContentQuote = ({post, onClick, showContext=false}: {post: FastPostProps, onClick?: () => void, showContext?: boolean}) => {
    const router = useRouter()

    if(!post.content.post.quote){
        return null
    }

    const collection = getCollectionFromUri(post.content.post.replyTo.uri)
    const center = collection == "ar.com.cabildoabierto.article" ?
        <ArticleQuote post={post}/> : <TopicQuote post={post}/>

    function handleClick(e) {
        e.stopPropagation()
        e.preventDefault()
        if(onClick){
            onClick()
        } else {
            router.push(contentUrl(post.content.post.replyTo.uri)+"#"+post.cid)

        }
    }

    let context = null
    if(showContext){
        const kind = collection == "ar.com.cabildoabierto.article" ? "artículo" : "tema"

        const parent = post.content.post.replyTo as RecordProps

        const title = kind == "artículo" ?
            (parent as ArticleProps).content.article.title : getTopicTitle((parent as TopicVersionOnFeedProps).content.topicVersion.topic)

        const href = contentUrl(parent.uri, parent.author.handle)

        context = <div className={"text-sm text-[var(--text-light)]"}>
            <Authorship onlyAuthor={true} content={parent}/> en <Link className="font-bold" onClick={(e) => {e.stopPropagation()}} href={href}>{title}</Link>
        </div>
    }

    return <blockquote
        className={"ml-3 bg-[var(--background-dark2)] border-l-4 border-[var(--text-light)] hover:bg-[var(--background-dark3)] cursor-pointer rounded py-2 px-3 my-1"}
        onClick={handleClick}
    >
        {context}
        {center}
    </blockquote>
}
import {FastPostProps} from "../../app/lib/definitions";
import {useArticle} from "../../hooks/user";
import {decompress} from "../compression";
import ReadOnlyEditor from "../editor/read-only-editor";
import {getCollectionFromUri} from "../utils";
import {useTopic, useTopicVersion} from "../../hooks/contents";
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

const ArticleQuote = ({post, quoteStr}: {post: FastPostProps, quoteStr: string}) => {
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


const TopicQuote = ({post, quoteStr}: {post: FastPostProps, quoteStr: string}) => {
    const parent = useTopicVersion(post.content.post.replyTo.uri)

    if(!parent.topic){
        return <LoadingSpinner size={"20px"}/>
    }


    const quote = JSON.parse(quoteStr)
    const parentContent = JSON.parse(decompress(parent.topic.content.text))

    const initialData = getSelectionFromJSONState(parentContent, quote)

    return <ReadOnlyEditor
        initialData={initialData}
    />
}


export const ContentQuote = ({post, onClick}: {post: FastPostProps, onClick?: () => void}) => {
    const quoteStr = post.content.post.quote
    if(!quoteStr){
        return null
    }

    const collection = getCollectionFromUri(post.content.post.replyTo.uri)
    const center = collection == "ar.com.cabildoabierto.article" ?
        <ArticleQuote post={post} quoteStr={quoteStr}/> : <TopicQuote post={post} quoteStr={quoteStr}/>



    function handleClick(e) {
        e.stopPropagation()
        e.preventDefault()
        onClick()
    }

    return <div className={"bg-[var(--background-dark2)] rounded p-2 my-1"} onClick={handleClick}>
        {center}
    </div>
}
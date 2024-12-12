import dynamic from 'next/dynamic';
import { nodesFromJSONStr } from './diff';
import { SerializedDiffNode } from './editor/nodes/DiffNode';
import { TopicProps, MatchesType } from '../app/lib/definitions';
import { wikiEditorSettings } from './editor/wiki-editor';
import { decompress } from './compression';

const MyLexicalEditor = dynamic( () => import( './editor/lexical-editor' ), { ssr: false } );


function showChanges(initialData: string, withRespectToContent: string, diff: MatchesType){
    const {common} = diff
    const nodes1 = nodesFromJSONStr(withRespectToContent)
    let parsed2 = null
    try {
        parsed2 = JSON.parse(initialData)
    } catch {
        return initialData // first version where content is ""
    }
    
    const nodes2 = parsed2.root.children

    function newDiffNode(kind: string, childNode){
        const diffNode: SerializedDiffNode = {
            children: [childNode],
            type: "diff",
            kind: kind,
            direction: 'ltr',
            version: 1,
            format: 'left',
            indent: 0
        }
        return diffNode
    }

    let i = 0
    let j = 0
    let newChildren = []
    for(let k = 0; k < common.length; k++){
        const {x, y} = common[k]
        while(i < x){
            newChildren.push(newDiffNode("removed", nodes1[i]))
            i++
        }
        while(j < y){
            newChildren.push(newDiffNode("new", nodes2[j]))
            j++
        }
        newChildren.push(newDiffNode("no dif", nodes1[x]))
        i++
        j++
    }
    while(i < nodes1.length){
        newChildren.push(newDiffNode("removed", nodes1[i]))
        i++
    }
    while(j < nodes2.length){
        newChildren.push(newDiffNode("new", nodes2[j]))
        j++
    }

    parsed2.root.children = newChildren
    const r = JSON.stringify(parsed2)

    return r
}


type ShowArticleChangesProps = {
    originalContent: {
        cid: string
        diff?: string
        content: {text: string}
    },
    originalContentText: string,
    entity: TopicProps,
    version: number
}


export const ShowArticleChanges = ({
    originalContent, originalContentText, entity, version}: ShowArticleChangesProps) => {
    const changesContent = entity.versions[version-1]

    if(!originalContent.diff){
        return <div className={"text-[var(--text-light)] text-center"}>Todavía no se calcularon los cambios.</div>
    }

    const contentText = showChanges(
        originalContentText,
        decompress(changesContent.content.text),
        JSON.parse(originalContent.diff)
    )

    let settings = wikiEditorSettings(true, originalContent, contentText)

    return <>
        <div className="text-sm text-center block lg:hidden content-container p-1 w-full">
            <p>Para ver qué cambió en esta versión del tema entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
        <div className="lg:block hidden">
        <MyLexicalEditor
            settings={settings}
            setEditor={(e) => {}}
            setEditorState={() => {}}
        />
        </div>
    </>
}
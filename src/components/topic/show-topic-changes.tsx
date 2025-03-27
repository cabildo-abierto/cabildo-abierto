import dynamic from 'next/dynamic';
import { nodesFromJSONStr } from './diff';
import { SerializedDiffNode } from '../editor/nodes/DiffNode';
import { TopicProps, MatchesType } from '../../app/lib/definitions';
import { wikiEditorSettings } from '../editor/wiki-editor';
import {SmallTopicVersionProps} from "./topic-content-expanded-view";
import {useTopicVersionChanges} from "../../hooks/contents";
import {getDidFromUri, getRkeyFromUri} from "../utils/uri";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {ErrorPage} from "../ui-utils/error-page";

const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );


function showChanges(newText: string, prevText: string, diff: MatchesType){
    const {common} = diff
    const nodes1 = nodesFromJSONStr(prevText)
    let parsed2 = null
    try {
        parsed2 = JSON.parse(newText)
    } catch {
        return newText // first version where content is ""
    }
    
    const nodes2 = parsed2.root.children

    function newDiffNode(kind: string, childNode: any){
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
    return JSON.stringify(parsed2)
}


export const ShowTopicChanges = ({
                                     topic,
                                     topicVersion
                                 }: {
    topic: TopicProps
    topicVersion: SmallTopicVersionProps
}) => {
    const {topicVersionChanges, isLoading} = useTopicVersionChanges(getDidFromUri(topicVersion.uri), getRkeyFromUri(topicVersion.uri));

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if(!topicVersionChanges){
        return <div className={"mt-8"}>
            <ErrorPage>
                Ocurrió un error al cargar el contenido.
            </ErrorPage>
        </div>
    }

    let settings = wikiEditorSettings(true, null, topicVersionChanges.text, "lexical", true, false)

    return <>
        <div className="text-sm text-center block lg:hidden content-container p-1 w-full">
            <p>Para ver qué cambió en esta versión del tema entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
        <div className="lg:block hidden">
            <MyLexicalEditor
                settings={settings}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    </>
}
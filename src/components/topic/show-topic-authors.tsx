import dynamic from "next/dynamic"
import { decompress } from "../utils/compression"
import { getAllText } from "./diff"
import { SerializedAuthorNode } from "../editor/nodes/AuthorNode"
import {TopicProps} from "../../app/lib/definitions";
import {wikiEditorSettings} from "../editor/wiki-editor";
import {ShowContributors} from "./show-contributors";
import {currentContent} from "./utils";
import {editorStateFromJSON} from "../utils/lexical";

const MyLexicalEditor = dynamic( () => import( '../editor/lexical-editor' ), { ssr: false } );

function showAuthors(topic: TopicProps, version: number){
    const versionText = currentContent(topic, version).content.text

    function newAuthorNode(authors: string[], childNode){
        const authorNode: SerializedAuthorNode = {
            children: [childNode],
            type: "author",
            authors: authors,
            direction: 'ltr',
            version: childNode.version,
            format: 'left',
            indent: 0
        }
        return authorNode
    }

    const parsed = editorStateFromJSON(versionText)
    if(!parsed) {
        return versionText
    }
    let prevNodes = []
    let prevAuthors = []

    for(let i = 0; i <= version; i++){
        const parsedVersion = editorStateFromJSON(decompress(topic.versions[i].content.text))
        if(!parsedVersion) continue
        const nodes = parsedVersion.root.children
        const {matches} = JSON.parse(topic.versions[i].content.topicVersion.diff)
        const versionAuthor = topic.versions[i].author.did
        let nodeAuthors: string[] = []
        for(let j = 0; j < nodes.length; j++){
            let authors = null
            for(let k = 0; k < matches.length; k++){
                if(matches[k] && matches[k].y == j){
                    const prevNodeAuthors = prevAuthors[matches[k].x]
                    if(getAllText(prevNodes[matches[k].x]) == getAllText(nodes[matches[k].y])){
                        authors = prevNodeAuthors
                    } else {
                        if(!prevNodeAuthors.includes(versionAuthor)){
                            authors = [...prevNodeAuthors, versionAuthor]
                        } else {
                            authors = prevNodeAuthors
                        }
                    }
                    break
                }
            }
            if(authors === null) authors = [versionAuthor]
            nodeAuthors.push(authors)
        }
        prevAuthors = [...nodeAuthors]
        prevNodes = [...nodes]
    }
    const newChildren = []
    for(let i = 0; i < prevNodes.length; i++){
        newChildren.push(newAuthorNode(prevAuthors[i], prevNodes[i]))
    }
    parsed.root.children = newChildren
    return JSON.stringify(parsed)
}


export const ShowTopicAuthors = ({
    topic, version
}: {
    topic: TopicProps,
    version: number
}) => {
    if(topic.versions[version].content.topicVersion.diff == undefined){
        return <div className={"text-[var(--text-light)] text-center mt-16"}>
            Todavía no se calcularon las contribuciones.
        </div>
    }

    const contentText = showAuthors(topic, version)

    let settings = wikiEditorSettings(true, null, contentText, "lexical", true, false)

    return <>
        <div className="text-sm text-center block lg:hidden content-container p-1">
            <p>Para ver qué usuario es autor de cada parte de este tema entrá a la página desde una pantalla más grande (por ejemplo una computadora).</p>
        </div>
        <div className="flex justify-center py-4">
            <div className="content-container bg-[var(--secondary-light)] rounded px-2 pb-2 text-sm sm:text-base flex flex-col items-center justify-center">
                <div className="text-[var(--text-light)]">Autores</div>
                <ShowContributors topicId={topic.id}/>
            </div>
        </div>
        <div className="hidden lg:block">
            <MyLexicalEditor
                settings={settings}
                setEditor={() => {}}
                setEditorState={() => {}}
            />
        </div>
    </>
}
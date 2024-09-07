import { useContent } from "src/app/hooks/contents"
import { getAllText, nodesCharDiff } from "./diff"
import { LexicalEditor } from "lexical"

function textNodesFromJSONStr(s: string){
    return JSON.parse(s).root.children.map(getAllText)
}

export const ChangesCounter = ({id1, id2, editor}: {id1: string, id2?: string, editor?: LexicalEditor}) => {
    const content1 = useContent(id1)
    const content2 = useContent(id2 ? id2 : id1)
    if(content1.isLoading || content2.isLoading){
        return <></>
    }

    const parsed1 = textNodesFromJSONStr(content1.content.text)
    let parsed2 = null
    if(id2){
        if(content2.content.text.length == 0){
            parsed2 = []
        } else {
            parsed2 = textNodesFromJSONStr(content2.content.text)
        }
    } else {
        parsed2 = textNodesFromJSONStr(JSON.stringify(editor.getEditorState()))
    }

    const {newChars, removedChars} = nodesCharDiff(parsed1, parsed2)

    return <><span className="text-red-600">-{removedChars}</span> <span className="text-green-600">+{newChars}</span></>
}
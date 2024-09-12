import { useContent } from "../app/hooks/contents"
import { nodesCharDiff, textNodesFromJSONStr } from "./diff"
import { LexicalEditor } from "lexical"

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

    const {charsAdded, charsDeleted} = nodesCharDiff(parsed1, parsed2)

    return <><span className="text-red-600">-{charsDeleted}</span> <span className="text-green-600">+{charsAdded}</span></>
}
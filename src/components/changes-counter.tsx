import { useContent } from "../app/hooks/contents"
import { decompress } from "./compression"
import { nodesCharDiff, textNodesFromJSONStr } from "./diff"
import { LexicalEditor } from "lexical"

export const ChangesCounterCalc = ({id1, id2, editor}: {id1: string, id2?: string, editor?: LexicalEditor}) => {
    const content1 = useContent(id1)
    const content2 = useContent(id2 ? id2 : id1)
    if(content1.isLoading || content2.isLoading){
        return <></>
    }

    const parsed1 = textNodesFromJSONStr(decompress(content1.content.compressedText))
    let parsed2 = null
    if(id2){
        const content2Text = decompress(content2.content.compressedText)
        if(content2Text.length == 0){
            parsed2 = []
        } else {
            parsed2 = textNodesFromJSONStr(content2Text)
        }
    } else {
        parsed2 = textNodesFromJSONStr(JSON.stringify(editor.getEditorState()))
    }

    const {charsAdded, charsDeleted} = nodesCharDiff(parsed1, parsed2)

    return <ChangesCounter charsAdded={charsAdded} charsDeleted={charsDeleted}/>
}


export const ChangesCounter = ({charsAdded, charsDeleted}: {charsAdded: number, charsDeleted: number}) => {
    
    return <><span className="text-red-600">-{charsDeleted}</span> <span className="text-green-600">+{charsAdded}</span></>
}
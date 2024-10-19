import { useContent } from "../app/hooks/contents"
import { decompress } from "./compression"
import { nodesCharDiff, textNodesFromJSONStr } from "./diff"
import { LexicalEditor } from "lexical"


export const ChangesCounter = ({charsAdded, charsDeleted}: {charsAdded: number, charsDeleted: number}) => {
    
    return <><span className="text-red-600">-{charsDeleted}</span> <span className="text-green-600">+{charsAdded}</span></>
}
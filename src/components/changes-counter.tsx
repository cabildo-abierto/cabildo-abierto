import { useContent } from "src/app/hooks/contents"
import { nodesCharDiff } from "./diff"
import { LexicalEditor } from "lexical"

export const ChangesCounter = ({id1, id2, editor}: {id1: string, id2?: string, editor?: LexicalEditor}) => {
    const content1 = useContent(id1)
    const content2 = useContent(id2 ? id2 : id1)
    if(content1.isLoading || content2.isLoading){
        return <></>
    }

    const parsed1 = JSON.parse(content1.content.text)
    let parsed2 = null
    if(id2){
        parsed2 = JSON.parse(content2.content.text)
    } else {
        parsed2 = JSON.parse(JSON.stringify(editor.getEditorState()))
    }

    const {newChars, removedChars} = nodesCharDiff(parsed1.root.children, parsed2.root.children)

    return <div className="text-center">
        <span className="text-red-600">-{removedChars}</span> <span className="text-green-600">+{newChars}</span> (caracteres)
    </div>
}
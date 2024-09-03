import { useContent } from "src/app/hooks/contents"
import { charDiff, diff, getAllText } from "./diff"
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

    let removedChars = 0
    let newChars = 0
    const {common, matches} = diff(parsed1.root.children, parsed2.root.children)
    for(let i = 0; i < parsed1.root.children.length; i++){
        if(!matches.some(({x, y}) => (i == x))){
            removedChars += getAllText(parsed1.root.children[i]).length
        }
    }

    for(let i = 0; i < parsed2.root.children.length; i++){
        if(!matches.some(({x, y}) => (i == y))){
            newChars += getAllText(parsed2.root.children[i]).length
        }
    }

    for(let i = 0; i < matches.length; i++){
        if(matches[i]){
            const node1 = getAllText(parsed1.root.children[matches[i].x])
            const node2 = getAllText(parsed2.root.children[matches[i].y])
            const matchDiff = charDiff(node1, node2)
            removedChars += matchDiff.deletions
            newChars += matchDiff.insertions
        }
    }

    return <div className="text-center">
        <span className="text-red-600">-{removedChars}</span> <span className="text-green-600">+{newChars}</span> (caracteres)
    </div>
}
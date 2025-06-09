import {$getRoot, $isDecoratorNode, $isElementNode, $isTextNode, EditorState, ElementNode} from "lexical";
import {
    editorStateToMarkdown,
    editorStateToMarkdownNoEmbeds
} from "../../modules/ca-lexical-editor/src/markdown-transforms";

export function nodesEqual(node1: any, node2: any){
    if(node1.type != node2.type){
        return false
    }
    const keys1 = Object.keys(node1);
    const keys2 = Object.keys(node2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    function keyEquals(key: string){
        if(key == "children"){
            if(node1.children.length != node2.children.length) return false
            for(let i = 0; i < node1.children.length; i++){
                if(!nodesEqual(node1.children[i], node2.children[i])){
                    return false
                }
            }
            return true
        } else if(key == "textFormat"){
            return true
        } else {
            return node1[key] == node2[key]
        }
    }

    for (let key of keys1) {
        if (!keys2.includes(key) || !keyEquals(key)) {
            return false;
        }
    }

    return true
}

export function $isWhitespace(node: ElementNode): boolean {
    for (const child of node.getChildren()) {
        if (
            ($isElementNode(child) && !$isWhitespace(child)) ||
            ($isTextNode(child) && child.getTextContent().trim() !== "") ||
            $isDecoratorNode(child)
        ) {
            return false;
        }
    }
    return true;
}

export function emptyOutput(editorState: EditorState | undefined) {
    if (!editorState) return true

    const t1 = Date.now()
    const res = editorState.read(() => {
        const root = $getRoot()
        const children = root.getChildren()

        for(let i = 0; i < children.length; i++) {
            const child = children[i]
            if(child.getTextContent().trim() !== ""){
                return false
            }
        }

        return true
    })
    return res
}

function findMentionsInNode(node: any): { id: string }[] {
    let references: { id: string }[] = []
    if (node.type === "custom-beautifulMention") {
        references.push({id: node.data.id})
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            const childRefs = findMentionsInNode(node.children[i])
            childRefs.forEach((x) => {
                references.push(x)
            })
        }
    }
    return references
}

export function editorStateFromJSON(text: string) {
    let res = null
    try {
        res = JSON.parse(text)
    } catch {

    }
    return res
}

export function charCount(state: EditorState | undefined) {
    let count = state.read(() => {
        const root = $getRoot()
        return root.getTextContentSize()
    })
    return count
}
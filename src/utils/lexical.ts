import {$getRoot, EditorState} from "lexical"

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


export function emptyOutput(editorState: EditorState | undefined) {
    if (!editorState) return true

    return editorState.read(() => {
        const root = $getRoot()
        const children = root.getChildren()

        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (child.getTextContent().trim() !== "") {
                return false
            }
        }

        return true
    })
}


export function charCount(state: EditorState | undefined) {
    return state.read(() => {
        const root = $getRoot()
        return root.getTextContentSize()
    })
}
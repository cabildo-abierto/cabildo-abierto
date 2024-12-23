import {$createPoint, $getRoot, $getSelection, $isElementNode, EditorState, LexicalNode, PointType} from "lexical";


export function getNodeFromIndex(node: LexicalNode, index: number[]){
    if(index.length == 0) return node

    if($isElementNode(node)){
        if(node.getType() == "sidenote"){
            return getNodeFromIndex(node.getChildAtIndex(0), index)
        }
        const child = node.getChildAtIndex(index[0])
        return getNodeFromIndex(child, index.slice(1))
    } else {
        return null
    }
}


export function getPointTypeFromIndex(node: LexicalNode, index: number[], offset: number){

    const pointedNode = getNodeFromIndex(node, index)
    const type = pointedNode.getType()

    if(type == "text" || type == "element"){
        return $createPoint(pointedNode.getKey(), offset, type)
    } else {
        return null
    }
}


function getNodeIndex(node: LexicalNode): number[]{

    let parent
    try {
        parent = node.getParent()
        if(!parent) return []
    } catch {
        return [] // root
    }

    if(parent.getType() == "sidenote"){
        return getNodeIndex(parent)
    }

    const parentIndex = getNodeIndex(parent)
    const index = node.getIndexWithinParent()
    return [...parentIndex, index]
}


function getEditorPointer(pointer: PointType) {
    const node = pointer.getNode()

    return {node: getNodeIndex(node), offset: pointer.offset}
}


export function getStandardSelection(state: EditorState){
    return state.read(() => {
        const selection = $getSelection()
        const [start, end] = selection.getStartEndPoints()

        if(selection.isBackward()){
            return {
                start: getEditorPointer(end),
                end: getEditorPointer(start),
            }
        } else {
            return {
                start: getEditorPointer(start),
                end: getEditorPointer(end)
            }
        }

    })
}
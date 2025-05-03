import {$createPoint, $getSelection, $isElementNode, EditorState, LexicalNode, PointType} from "lexical";


export function getNodeFromIndex(node: LexicalNode, index: number[]){
    if(index.length == 0) return node

    if($isElementNode(node)){
        const child = node.getChildAtIndex(index[0])
        return getNodeFromIndex(child, index.slice(1))
    } else {
        return null
    }
}


export function getPointTypeFromIndex(node: LexicalNode, index: number[], offset: number){

    const pointedNode = getNodeFromIndex(node, index)
    if(!pointedNode) return null

    const type = pointedNode.getType()

    if(type == "text" || type == "element"){
        return $createPoint(pointedNode.getKey(), offset, type)
    } else {
        return null
    }
}


function getNodeIndex(node: LexicalNode): number[]{
    try {
        const parent = node.getParent()
        if(!parent) return []
        const parentIndex = getNodeIndex(parent)
        const index = node.getIndexWithinParent()
        return [...parentIndex, index]
    } catch {
        return [] // root
    }
}


function getEditorPointer(pointer: PointType) {
    const node = pointer.getNode()

    return {node: getNodeIndex(node), offset: pointer.offset}
}


export type LexicalStandardSelectionPointer = {
    node: number[]
    offset: number
}


export type LexicalStandardSelection = {
    start: LexicalStandardSelectionPointer,
    end: LexicalStandardSelectionPointer,
}


export function getStandardSelection(state: EditorState): LexicalStandardSelection {
    return state.read(() => {
        const selection = $getSelection()
        if(!selection) return
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
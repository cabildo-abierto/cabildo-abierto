import { levenshtein } from "./levenshtein"


/*function lcs(a: string, b: string) {
    const matrix = Array(a.length + 1).fill([]).map(() => Array(b.length + 1).fill(0));
    for(let i = 1; i < a.length + 1; i++) {
        for(let j = 1; j < b.length + 1; j++) {
            if(a[i-1] === b[j-1]) {
                matrix[i][j] = 1 + matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.max(matrix[i-1][j], matrix[i][j-1]);
            }
        }
    }
    return matrix[a.length][b.length];
}



function textDiff(prevText: string, text: string){
    return levenshtein(prevText, text)
}*/


/*function diffFromNode(prevStateNode: any, stateNode: any){
    let diff = 0
    if(stateNode.type == "text"){
        if(prevStateNode.type == "text"){
            console.log("---------------------------------------")
            console.log("Two text nodes", prevStateNode.text, stateNode.text)
            diff += textDiff(prevStateNode.text, stateNode.text)
        } else {
            console.log("---------------------------------------")
            console.log("Current is text:", stateNode.text)
            console.log("Prev is:", prevStateNode.type)
        }
    } else {
        for(let i = 0; i < stateNode.children.length; i++){
            if(i < prevStateNode.children.length){
                diff += diffFromNode(prevStateNode.children[i], stateNode.children[i])
            } else {
                console.log("extra node of type", stateNode.children[i].type)
            }
        }
    }
    return diff
}*/

/*function getTextNodes(node: any){
    let textNodes = []
    if(node.type == "text"){
        textNodes.push(node)
    }
    if(node.children)
        for(let i = 0; i < node.children.length; i++){
            textNodes = [...textNodes, ...getTextNodes(node.children[i])]
        }
    return textNodes
}*/


export function getAllText(node: any){
    let text = ""
    if(node.type == "text"){
        text += node.text
    }
    if(node.children)
        for(let i = 0; i < node.children.length; i++){
            text += getAllText(node.children[i])
        }
    return text
}

/*export function getCharDiff(prevState: any, state: any){
    const text1 = getAllText(prevState.root)
    const text2 = getAllText(state.root)
    return levenshtein(text1, text2)
}*/

// Tendría que ser matching de costo mínimo para matchear nodos que no sean iguales
export function minMatch(nodes1, nodes2){
    const matches = []
    const matched = new Array(nodes2.length).fill(false)
    for(let i = 0; i < nodes1.length; i++){
        for(let j = 0; j < nodes2.length; j++){
            if(!matched[j] && nodes1[i] == nodes2[j]){
                matches.push({x: i, y: j})
                matched[j] = true
            }
        }
    }
    return matches
}

export function diff(prevState: any, state: any){
    const nodes1 = prevState.root.children.map(getAllText)
    const nodes2 = state.root.children.map(getAllText)

    const matches: {x: number, y: number}[] = minMatch(nodes1, nodes2)

    const removedNodes = []
    for(let i = 0; i < nodes1.length; i++){
        if(!matches.some(({x, y}) => (x == i))){
            removedNodes.push(i)
        }
    }

    const newNodes = []
    for(let i = 0; i < nodes2.length; i++){
        if(!matches.some(({x, y}) => (y == i))){
            newNodes.push(i)
        }
    }

    return {matches: matches, newNodes: newNodes, removedNodes: removedNodes}
}
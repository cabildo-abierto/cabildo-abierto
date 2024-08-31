import { levenshtein } from "./levenshtein"


function lcs(a: string, b: string) {
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
}



function diffFromNode(prevStateNode: any, stateNode: any){
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
}

function getTextNodes(node: any){
    let textNodes = []
    if(node.type == "text"){
        textNodes.push(node)
    }
    if(node.children)
        for(let i = 0; i < node.children.length; i++){
            textNodes = [...textNodes, ...getTextNodes(node.children[i])]
        }
    return textNodes
}


function getAllText(node: any){
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

export function getCharDiff(prevState: any, state: any){
    const text1 = getAllText(prevState.root)
    const text2 = getAllText(state.root)
    return levenshtein(text1, text2)
}

export function getNewNodes(prevTextNodes, textNodes){

}

export function diff(prevState: any, state: any){
    console.log("STARTING DIFF *********************************")
    //const text1 = getTextNodes(prevState.root)
    //const text2 = getTextNodes(state.root)
    
    const diffCount = getCharDiff(prevState, state)

    const text1 = getAllText(prevState.root)
    const text2 = getAllText(state.root)

    console.log(text1)
    console.log(text2)
    console.log(lcs(text1, text2))

    return diffCount
}

// idealmente, tengo que ver qué nodos de texto desaparecieron y qué nodos de texto nuevos aparecieron.
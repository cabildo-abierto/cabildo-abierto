import { assignment } from "./min-cost-flow"


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


export function charDiff(str1: string, str2: string){
    const common = lcs(Array.from(str1), Array.from(str2))

    const insertions = str2.length - common.length
    const deletions = str1.length - common.length
    return {
        total: insertions+deletions,
        insertions: insertions,
        deletions: deletions
    }
}


export function wordDiff(str1: string, str2: string){
    const common = lcs(str1.split(" "), str2.split(" "))

    const insertions = str2.length - common.length
    const deletions = str1.length - common.length
    return {
        total: insertions+deletions,
        insertions: insertions,
        deletions: deletions
    }
}


export function textNodesFromJSONStr(s: string){
    return nodesFromJSONStr(s).map(getAllText)
}


export function nodesFromJSONStr(s: string){
    try {
        return JSON.parse(s).root.children
    } catch {
        return []
    }
}


export function charDiffFromJSONString(str1: string, str2: string){
    const nodes1 = textNodesFromJSONStr(str1)
    const nodes2 = textNodesFromJSONStr(str2)

    return nodesCharDiff(nodes1, nodes2)
}

export function makeMatrix(n, m, v){
    let M = new Array<Array<number>>(n)
    for(let i = 0; i < n; i++) M[i] = new Array<number>(m).fill(v)
    return M
}

export function minMatch(nodes1, nodes2, common: {x: number, y: number}[]){
    if(nodes1.length == 0 || nodes2.length == 0) return []
    
    const commonNodes1 = new Set(common.map(({x, y}) => (x)))
    const commonNodes2 = new Set(common.map(({x, y}) => (y)))
    
    let uncommonNodes1 = []
    nodes1.forEach((x, index) => {
        if(!commonNodes1.has(index)){
            uncommonNodes1.push({node: x, index: index})
        }
    })
    let uncommonNodes2 = []
    nodes1.forEach((x, index) => {
        if(!commonNodes2.has(index)){
            uncommonNodes2.push({node: x, index: index})
        }
    })

    let a = makeMatrix(uncommonNodes1.length, uncommonNodes2.length, 0)

    for(let i = 0; i < uncommonNodes1.length; i++){
        for(let j = 0; j < uncommonNodes2.length; j++){
            a[i][j] = charDiff(uncommonNodes1[i].node, uncommonNodes2[j].node).total
        }
    }
    const t2 = Date.now()

    let res = assignment(a)
    const t3 = Date.now()

    let resDicts = res.map((y, x) => ({x: x, y: y}))
    resDicts = resDicts.map(({x, y}) => ({x: uncommonNodes1[x].index, y: uncommonNodes2[y].index}))

    return [...common, ...resDicts]
}


function areArraysEqual(s1: any[], s2: any[]){
    if(s1.length != s2.length) return false

    for(let i = 0; i < s1.length; i++){
        if(s1[i] !== s2[i]){
            return false
        }
    }
    return true
}


function lcs(s1: any[], s2: any[]) {
    const n = s1.length;
    const m = s2.length;

    if(areArraysEqual(s1, s2)){
        return s1
    }

    // dp[i][j] = la mayor subcadena incluyendo hasta i-1 y j-1
    const dp = Array.from({length : n+1}, () => Array(m+1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (s1[i-1] === s2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }

    const common = []

    let i = s1.length-1;
    let j = s2.length-1;
    while(i >= 0 && j >= 0){
        if(s1[i] == s2[j]){
            common.push({x: i, y: j})
            i--
            j--
        } else if(j == 0){
            i--
        } else if(i == 0){
            j--
        } else if(dp[i][j+1] >= dp[i+1][j]){
            i--
        } else {
            j--
        }
    }
    return common.reverse();
}


export function diff(nodes1: string[], nodes2: string[]){
    const common: {x: number, y: number}[] = lcs(nodes1, nodes2)

    let matches: {x: number, y: number}[] = minMatch(nodes1, nodes2, common)

    let perfectMatches = matches.filter(({x, y}) => {
        return nodes1[x] == nodes2[y]
    })
    /*matches = matches.filter(({x, y}) => {
        const d = charDiff(nodes1[x], nodes2[y]).total
        const maxDist = nodes1[x].length + nodes2.length 
        return d < maxDist/2 // tienen al menos la mitad en común
    })*/

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

    return {common: common, matches: matches, perfectMatches: perfectMatches}
}


export function nodesCharDiff(nodes1, nodes2) {
    const {common, matches, perfectMatches} = diff(nodes1, nodes2)
    
    let charsDeleted = 0
    let charsAdded = 0
    for(let i = 0; i < nodes1.length; i++){
        if(!matches.some(({x, y}) => (i == x))){
            charsDeleted += nodes1[i].length
        }
    }

    for(let i = 0; i < nodes2.length; i++){
        if(!matches.some(({x, y}) => (i == y))){
            charsAdded += nodes2[i].length
        }
    }

    for(let i = 0; i < matches.length; i++){
        if(matches[i]){
            const node1 = nodes1[matches[i].x]
            const node2 = nodes2[matches[i].y]
            const matchDiff = charDiff(node1, node2)
            charsDeleted += matchDiff.deletions
            charsAdded += matchDiff.insertions
        }
    }

    return {charsAdded: charsAdded, charsDeleted: charsDeleted, 
        matches: matches, common: common, perfectMatches: perfectMatches}
}
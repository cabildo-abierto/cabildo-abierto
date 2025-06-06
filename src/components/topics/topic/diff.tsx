import { assignment } from "./min-cost-flow"
import {areArraysEqual, makeMatrix} from "@/utils/arrays";


export function getPlainText(node: any){
    let text = ""
    if(node.type == "text"){
        text += node.text
    }
    if(node.children) {
        for (let i = 0; i < node.children.length; i++) {
            text += getPlainText(node.children[i])
        }
    }
    if(node.type == "paragraph"){
        text += "\n"
    }
    if(node.type == "linebreak"){
        text += "\n"
    }
    return text
}


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
    if(str1 == str2) return {total: 0, insertions: 0, deletions: 0}

    if(str1.length * str2.length > 10000000){
        return {total: str1.length + str2.length, insertions: str2.length, deletions: str1.length}
    }

    const common = lcs(Array.from(str1), Array.from(str2))

    const insertions = str2.length - common.length
    const deletions = str1.length - common.length
    return {
        total: insertions+deletions,
        insertions: insertions,
        deletions: deletions
    }
}


export function nodesFromJSONStr(s: string){
    try {
        const root = JSON.parse(s).root
        return root.children
    } catch {
        return []
    }
}


export function minMatch(nodes1: string[], nodes2: string[], common: {x: number, y: number}[]){
    if(nodes1.length == 0 || nodes2.length == 0) return []
    
    const commonNodes1 = new Set(common.map(({x}) => (x)))
    const commonNodes2 = new Set(common.map(({y}) => (y)))
    
    let uncommonNodes1 = []
    nodes1.forEach((x, index) => {
        if(!commonNodes1.has(index)){
            uncommonNodes1.push({node: x, index: index})
        }
    })
    let uncommonNodes2 = []
    nodes2.forEach((x, index) => {
        if(!commonNodes2.has(index)){
            uncommonNodes2.push({node: x, index: index})
        }
    })

    if(uncommonNodes1.length == 0 || uncommonNodes2.length == 0){
        return [...common]
    }

    let a = makeMatrix(uncommonNodes1.length, uncommonNodes2.length, 0)

    for(let i = 0; i < uncommonNodes1.length; i++){
        for(let j = 0; j < uncommonNodes2.length; j++){
            const d = charDiff(uncommonNodes1[i].node, uncommonNodes2[j].node)
            a[i][j] = d.total
        }
    }

    let res = assignment(a)

    let resDicts = res.map((y, x) => ({x: x, y: y}))
    resDicts = resDicts.map(({x, y}) => ({x: uncommonNodes1[x].index, y: uncommonNodes2[y].index}))

    return [...common, ...resDicts]
}


function lcs(s1: any[], s2: any[]) {
    const n = s1.length;
    const m = s2.length;

    if(areArraysEqual(s1, s2)){
        // todos los índices
        return Array.from({ length: s1.length }, (_, index) => ({x: index, y: index}));
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


export function diff(nodes1: string[], nodes2: string[], safe: boolean = false){
    const common: {x: number, y: number}[] = lcs(nodes1, nodes2)

    if(safe && (nodes1.length - common.length) * (nodes2.length - common.length) > 10000){
        return null
    }
    let matches: {x: number, y: number}[] | null = minMatch(nodes1, nodes2, common)

    if(matches == null) return null

    matches = matches.filter((m) => (m != undefined))

    let perfectMatches = matches.filter(({x, y}) => {
        return x != undefined && y != undefined && nodes1[x] == nodes2[y]
    })

    const removedNodes = []
    for(let i = 0; i < nodes1.length; i++){
        if(!matches.some(({x}) => (x == i))){
            removedNodes.push(i)
        }
    }

    const newNodes = []
    for(let i = 0; i < nodes2.length; i++){
        if(!matches.some(({y}) => (y == i))){
            newNodes.push(i)
        }
    }

    return {common: common, matches: matches, perfectMatches: perfectMatches}
}


export function nodesCharDiff(nodes1: string[], nodes2: string[], safe: boolean = false) {
    const d = diff(nodes1, nodes2, safe)
    if(!d) return null

    const {common, matches, perfectMatches} = d

    let charsDeleted = 0
    let charsAdded = 0
    for(let i = 0; i < nodes1.length; i++){
        if(!matches.some(({x}) => (i == x))){
            charsDeleted += nodes1[i].length
        }
    }

    for(let i = 0; i < nodes2.length; i++){
        if(!matches.some(({y}) => (i == y))){
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
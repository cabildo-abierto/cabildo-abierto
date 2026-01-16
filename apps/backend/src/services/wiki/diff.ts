import { assignment } from "./min-cost-flow.js"
import {makeMatrix, range} from "@cabildo-abierto/utils";
import {areArraysEqual} from "@cabildo-abierto/utils";


export function charDiff(str1: string, str2: string){
    if(str1 == str2) return {total: 0, insertions: 0, deletions: 0}

    if(str1.length * str2.length > 10000000){
        //console.log(str1)
        //console.log(str2)
        //console.log("Product size is", str1.length*str2.length)
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


export function minMatch(nodes1: string[], nodes2: string[], common: {x: number, y: number}[], safe: boolean = true){
    if(nodes1.length == 0 || nodes2.length == 0) return []
    
    const commonNodes1 = new Set(common.map(({x}) => (x)))
    const commonNodes2 = new Set(common.map(({y}) => (y)))
    
    let uncommonNodes1: any[] = []
    nodes1.forEach((x, index) => {
        if(!commonNodes1.has(index)){
            uncommonNodes1.push({node: x, index: index})
        }
    })
    let uncommonNodes2: any[] = []
    nodes2.forEach((x, index) => {
        if(!commonNodes2.has(index)){
            uncommonNodes2.push({node: x, index: index})
        }
    })

    if(uncommonNodes1.length == 0 || uncommonNodes2.length == 0){
        return [...common]
    }

    let res: number[]
    if(safe && uncommonNodes1.length * uncommonNodes2.length > 100000){
        // hay demasiados nodos distintos, no podemos armar la matriz, los matcheamos en orden
        res = range(Math.min(uncommonNodes1.length, uncommonNodes2.length))
    } else {
        let a = makeMatrix(uncommonNodes1.length, uncommonNodes2.length, 0)

        for(let i = 0; i < uncommonNodes1.length; i++){
            for(let j = 0; j < uncommonNodes2.length; j++){
                const d = charDiff(uncommonNodes1[i].node, uncommonNodes2[j].node)
                a[i][j] = d.total
            }
        }

        res = assignment(a)
    }

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


export function diff(nodes1: string[], nodes2: string[], safe: boolean = true){
    const common: {x: number, y: number}[] = lcs(nodes1, nodes2)

    let matches: {x: number, y: number}[] = minMatch(nodes1, nodes2, common, safe)

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


export function nodesCharDiff(nodes1: string[], nodes2: string[], safe: boolean = true) {
    const d = diff(nodes1, nodes2, safe)

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
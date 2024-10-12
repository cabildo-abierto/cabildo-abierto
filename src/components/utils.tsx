import { UserProps, EntityProps, SmallEntityProps, EntityVersionProps, ContentProps } from "../app/lib/definitions"
import { charDiffFromJSONString, getAllText } from "./diff"
import { db } from "../db"
import { decompress } from "./compression"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, EditorState, ElementNode } from "lexical"


export const splitPost = (text: string) => {
    if(!text.includes("</h1>")) return null
    const split = text.split("</h1>")
    if(!split[0].includes("<h1>")) return null
    if(split[1].length == 0) return null
    const title = split[0].split("<h1>")[1]
    if(title == "&nbsp;") return null
    return {title: title, text: split[1]}
}


export function stopPropagation(func: () => void) {
    return (e: any) => {e.stopPropagation(); func()}
}


export function subscriptionEnds(start: Date): Date {
    const endDate = new Date(start);

    endDate.setMonth(endDate.getMonth() + 1);

    return endDate;
}


export function nextSubscriptionEnd(user: UserProps, extraMonths: number = 0){
    const currentSubscriptionEnd = new Date(user.subscriptionsUsed[user.subscriptionsUsed.length-1].endsAt as Date | string)
    const nextEnd = new Date(currentSubscriptionEnd)
    nextEnd?.setMonth(nextEnd.getMonth()+extraMonths)

    return nextEnd
}


export function validSubscription(user: UserProps | undefined){
    if(!user) return false
    if(user.subscriptionsUsed.length == 0) return false

    const nextEnd = nextSubscriptionEnd(user)
    return nextEnd > new Date()
}


export const permissionToPrintable = (level: string) => {
    if(level == "Administrator"){
        return "Administrador"
    } else if(level == "Beginner"){
        return "Editor aprendiz"
    } else if(level == "Editor"){
        return "Editor"
    }
}


export const permissionToNumber = (level: string) => {
    if(level == "Administrator"){
        return 2
    } else if(level == "Beginner"){
        return 0
    } else if(level == "Editor"){
        return 1
    }
}


export const hasEditPermission = (user: UserProps | null, level: string) => {
    return user && permissionToNumber(user.editorStatus) >= permissionToNumber(level)
}


export function sumFromFirstEdit(values: number[], entity: EntityProps, userId: string) {
    let total = 0
    let firstEdit = 0
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].author.id == userId){
            firstEdit = i
            break
        }
    }
    for(let i = firstEdit; i < values.length; i++) total += values[i]
    return total
}


export function arraySum(a: any[]) {
    return a.reduce((acc, curr) => acc + curr, 0)
}


function currentCategories(entity: {versions: {id: string, categories: string}[]}){
    return JSON.parse(entity.versions[entity.versions.length-1].categories)
}


function areArraysEqual(a: any[], b: any[]){
    if(a.length != b.length) return false
    for(let i = 0; i < a.length; i++){
        if(a[i] != b[i]) return false
    }
    return true
}


export function isPrefix(p: any[], q: any[]){
    if(p.length > q.length) return false
    return areArraysEqual(p, q.slice(0, p.length))
}

export function getNextCategories(route: string[], entities: SmallEntityProps[]){
    const nextCategories = new Set<string>()
    
    entities.forEach((entity: SmallEntityProps) => {
        const categories: string[][] = currentCategories(entity)
        if(!categories) return
        categories.forEach((category: string[]) => {
            if(isPrefix(route, category)){
                if(category.length > route.length){
                    nextCategories.add(category[route.length])
                }
            }
        })
    })

    return Array.from(nextCategories)
}

export function entityInRoute(entity: {versions: {id: string, categories: string}[]}, route: string[]){
    const categories = currentCategories(entity)
    if(route.length == 0) return true
    if(!categories) return false // esto no debería pasar
    return categories.some((c: string[]) => {
        return isPrefix(route, c)
    })
}


export function listOrder(a: {score: number[]}, b: {score: number[]}){
    for(let i = 0; i < a.score.length; i++){
        if(a.score[i] > b.score[i]){
            return 1
        } else if(a.score[i] < b.score[i]){
            return -1
        }
    }
    return 0
}


export function listOrderDesc(a: {score: number[]}, b: {score: number[]}){
    return -listOrder(a, b)
}


export const monthly_visits_limit = 25


export function visitsThisMonth(visits: {createdAt: Date}[]){
    let c = 0
    for(let i = 0; i < visits.length; i++){
        const date = visits[i].createdAt
        const curDate = new Date()
        if(date.getMonth() == curDate.getMonth() && date.getFullYear() == curDate.getFullYear()){
            c ++
        }
    }
    return c
}


//export const accessToken = "TEST-8751944294701489-091623-4f6d3596d15c9b3fd4c1308124c73f6e-536751662"
export const accessToken = "APP_USR-8751944294701489-091623-00cbcdbdbb328be11bd3e67a76ff0369-536751662"


export async function updateEntityContributions(entity: EntityProps){
    let accCharsAdded = 0
    const authorAccCharsAdded = new Map<string, number>()

    for(let j = 0; j < entity.versions.length; j++){
        const {charsAdded, charsDeleted, matches, common, perfectMatches} = j == 0 ? {charsAdded: 0, charsDeleted: 0, matches: [], common: [], perfectMatches: []} :
            charDiffFromJSONString(decompress(entity.versions[j-1].compressedText), decompress(entity.versions[j].compressedText))
        
        accCharsAdded += charsAdded
        
        const author = entity.versions[j].author.id
        if(authorAccCharsAdded.has(author)){
            authorAccCharsAdded.set(author, authorAccCharsAdded.get(author) + charsAdded)
        } else {
            authorAccCharsAdded.set(author, charsAdded)
        }
        
        const diff = JSON.stringify({matches: matches, common: common, perfectMatches: perfectMatches})
        await db.content.update({
            data: {
                contribution: JSON.stringify(Array.from(authorAccCharsAdded)),
                accCharsAdded: accCharsAdded,
                charsAdded: charsAdded,
                charsDeleted: charsDeleted,
                diff: diff
            },
            where: {
                id: entity.versions[j].id
            }
        })
    }
}


export function route2Text(route: string[]){
    return ["Inicio", ...route].join("/")
}


export function currentVersion(entity: {versions: {id: string}[], currentVersionId: string}){
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].id == entity.currentVersionId){
            return i
        }
    }
    return entity.versions.length-1
}


export function currentVersionContent(entity: {versions: EntityVersionProps[], currentVersionId: string}){
    return entity.versions[currentVersion(entity)]
}

export function entityIdToName(s: string){
    return decodeURIComponent(s).replaceAll("_", " ")
}


export function getPlainText(jsonStr: string){
    if(jsonStr.length == 0 || jsonStr == "Este artículo está vacío!") return {
        numChars: 0,
        numWords: 0,
        numNodes: 0,
        plainText: ""
    }
    const json = JSON.parse(jsonStr)
    const text = getAllText(json.root)
    return {
        numChars: text.length,
        numWords: text.split(" ").length,
        numNodes: json.root.children.length,
        plainText: text
    }
}


export function isUndo(entityVersion: {undos: {id: string}[]}) {
    return entityVersion.undos.length > 0
}


export function isRejected(content: {rejectedById?: string}) {
    return content.rejectedById != null
}


export function isDemonetized(content: {undos: {id: string}[], rejectedById?: string, claimsAuthorship: boolean, charsAdded: number, confirmedById?: string, editPermission: boolean}){
    return !isPartOfContent(content) || !content.claimsAuthorship || content.charsAdded == 0
}


export function isPartOfContent(
    content: {
        undos: {id: string}[]
        rejectedById?: string
        claimsAuthorship: boolean
        editPermission: boolean
        confirmedById?: string
    }){
    return !isUndo(content) && (content.editPermission || content.confirmedById)
}


export function getVersionInEntity(contentId: string, entity: EntityProps){
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].id == contentId){
            return i
        }
    }
    return null
}


export function contributionsToProportionsMap(contributions: [string, number][]){
    let total = 0
    let map = {}
    for(let i = 0; i < contributions.length; i++){
        const [author, charCount] = contributions[i]
        total += charCount 
    }
    for(let i = 0; i < contributions.length; i++){
        const [author, charCount] = contributions[i]
        map[author] = charCount / total 
    }

    return map
}


export function getPreviewFromJSONStr(str: string, maxChars: number = 100){
    const json = JSON.parse(str)

    const root = json.root
    let last = 1
    let charCount = getAllText(root.children[0]).length
    while(last < root.children.length){
        charCount += getAllText(root.children[last]).length
        last ++
        if(charCount > maxChars){
            break
        }
    }

    json.root.children = root.children.slice(0, last)

    return JSON.stringify(json)
}


export function editorStateFromJSON(text: string){
    let res = null
    try {
        res = JSON.parse(text)
    } catch {

    }
    return res
}


function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function cleanText(s: string){
    return removeAccents(s.toLowerCase())
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

export function emptyOutput(editorState: EditorState | undefined){
    if(!editorState) return true

    const isEmpty = editorState.read(() => {
        const root = $getRoot();
        const child = root.getFirstChild();

        if (
            child == null ||
            ($isElementNode(child) && child.isEmpty() && root.getChildrenSize() === 1)
            ) {
        return true;
        }

        return $isWhitespace(root);
    });
    return isEmpty;
}

export function validPost(state: EditorState | undefined, charLimit: number){
    if(!state) return false
    if(!charLimit) return true
    let isValid = state.read(() => {
        const root = $getRoot()
        return root.getTextContentSize() <= charLimit
    })
    return isValid
}


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


export function hasChanged(state: EditorState | undefined, initialData: string){
    const json1 = state.toJSON()
    try {
        const json2 = JSON.parse(initialData)
        return !nodesEqual(json1.root, json2.root)
    } catch {
        return !emptyOutput(state)
    }
}


export function nextPrice(p: number){
    if(p == 500){
        return 1000
    } else if(p == 1000){
        return 1500
    } else {
        return "Error"
    }
}


export function articleUrl(id: string, index?: number){
    return "/articulo?i=" + id + (index ? "&v=" + index : "")
}


export function contentUrl(id: string){
    return "/contenido?i=" + id
}


export function editContentUrl(id: string){
    return "/editar/" + id
}


export function inRange(i, n){
    return i >= 0 && i < n
}


export function isPublic(content: ContentProps, isMainPage: boolean){
    if(content.type == "EntityContent"){
        return content.parentEntity.isPublic
    }
    if(content.type == "Post" && isMainPage){
        return false
    }
    return true
}
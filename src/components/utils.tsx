import {
    UserProps,
    SmallUserProps,
    BothContributionsProps,
    TopicVersionProps, TopicProps, TopicVersionOnFeedProps
} from "../app/lib/definitions"
import { getAllText } from "./diff"
import { $getRoot, $isDecoratorNode, $isElementNode, $isTextNode, EditorState, ElementNode } from "lexical"
import {SessionOptions} from "iron-session";
import React from "react";


export function isFastPost(e: {collection: string}){
    return e.collection == "app.bsky.feed.post" || isQuotePost(e)
}


export function isQuotePost(e: {collection: string}){
    return e.collection == "ar.com.cabildoabierto.quotePost"
}


export function getCollectionFromUri(uri: string){
    return uri.split("/")[3]
}


export function getUri(did: string, collection: string, rkey: string){
    return "at://" + did + "/" + collection + "/" + rkey
}


export function stopPropagation(func: () => void) {
    return (e: any) => {e.preventDefault(); e.stopPropagation(); func()}
}


export function isValidJSON(s: string){
    try {
        JSON.parse(s)
    } catch {
        return false
    }
    return true
}


export function subscriptionEnds(start: Date): Date {
    const endDate = new Date(start);

    endDate.setMonth(endDate.getMonth() + 1);

    return endDate;
}


export function nextSubscriptionEnd(user: {subscriptionsUsed: {endsAt: string | Date}[]}, extraMonths: number = 0){
    const currentSubscriptionEnd = new Date(user.subscriptionsUsed[user.subscriptionsUsed.length-1].endsAt as Date | string)
    const nextEnd = new Date(currentSubscriptionEnd)
    nextEnd?.setMonth(nextEnd.getMonth()+extraMonths)

    return nextEnd
}


export function validSubscription(user: {subscriptionsUsed: {endsAt: string | Date}[]} | undefined){
    if(!user) return false
    if(user.subscriptionsUsed.length == 0) return false

    const nextEnd = nextSubscriptionEnd(user)
    return nextEnd > new Date()
}


export function isPost(collection: string){
    return collection == "ar.com.cabildoabierto.quotePost" || collection == "app.bsky.feed.post"
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


export function arraySum(a: any[]) {
    return a.reduce((acc, curr) => acc + curr, 0)
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


export function newestFirst(a: {createdAt?: Date}, b: {createdAt?: Date}){
    if(!a.createdAt || !b.createdAt) return 0
    return b.createdAt.getTime() - a.createdAt.getTime()
}


export function oldestFirst(a: {createdAt?: Date}, b: {createdAt?: Date}){
    return -newestFirst(a, b)
}


export function listOrder(a: {score?: number[]}, b: {score?: number[]}){
    if(!a.score || !b.score) return 0
    for(let i = 0; i < a.score.length; i++){
        if(a.score[i] > b.score[i]){
            return 1
        } else if(a.score[i] < b.score[i]){
            return -1
        }
    }
    return 0
}


export function listOrderDesc(a: {score?: number[]}, b: {score?: number[]}){

    return -listOrder(a, b)
}


export const monthly_visits_limit = 10


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

export function route2Text(route: string[]){
    return ["Inicio", ...route].join("/")
}


export function currentVersion(entity: {versions: {}[]}){
    /*for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].cid == entity.currentVersionId){
            return i
        }
    }*/
    // TO DO: Implementar
    return entity.versions.length-1
}


export function currentCategories(topic: {versions: {categories?: string}[]}) {
    for(let i = topic.versions.length-1; i > 0; i--){
        if(topic.versions[i].categories != null){
            return JSON.parse(topic.versions[i].categories) as string[]
        }
    }
    return []
}


export function currentVersionContent(entity: {versions: TopicVersionProps[], currentVersionId: string}){
    return entity.versions[currentVersion(entity)]
}


export function getPlainText(jsonStr: string){
    if(jsonStr.length == 0 || jsonStr == "Este artículo está vacío!") return {
        numChars: 0,
        numWords: 0,
        numNodes: 0,
        plainText: ""
    }

    let json
    try {
        json = JSON.parse(jsonStr)
    } catch {
        return {error: "error on parse json"}
    }

    const text = getAllText(json.root)
    return {
        numChars: text.length,
        numWords: text.split(" ").length,
        numNodes: json.root.children.length as number,
        plainText: text
    }
}


export function isRejected(content: {rejectedById?: string}) {
    return content.rejectedById != null
}


export function isTopicVersionDemonetized(content: TopicVersionProps){
    return false
}


export function isPartOfTopic(content: TopicVersionProps){
    return true
}


export function getVersionInEntity(uri: string, entity: TopicProps){
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].uri == uri){
            return i
        }
    }
    return null
}


export function contributionsToProportionsMap(contributions: BothContributionsProps, author: string){
    let map = {}

    if(!contributions.all.some(([a, x]) => (a == author))){
        contributions.all.push([author, 0])
    }

    let total = 0
    for(let i = 0; i < contributions.monetized.length; i++){
        const [author, charCount] = contributions.monetized[i]
        total += charCount 
    }

    const monetized = total > 0

    for(let i = 0; i < contributions.all.length; i++){
        const [author, charCount] = contributions.all[i]
        map[author] = 1.0 / contributions.all.length * (monetized ? 0.1 : 1)
    }

    if(total > 0){
        for(let i = 0; i < contributions.monetized.length; i++){
            const [author, charCount] = contributions.monetized[i]
            map[author] += charCount / total * 0.9
        }
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


function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function cleanText(s: string): string {
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


export function charCount(state: EditorState | undefined){
    let count = state.read(() => {
        const root = $getRoot()
        return root.getTextContentSize()
    })
    return count
}


function getImageCountInNode(node: any){
    if(node.type == "image"){
        return 1
    }
    if(!node.children) return 0
    let count = 0
    for(let i = 0; i < node.children.length; i++){
        count += getImageCountInNode(node.children[i])
    }
    return count
}


function getImageCount(state: EditorState){
    const root = state.toJSON().root

    return getImageCountInNode(root)
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


export function hasChanged(state: EditorState | undefined, initialData: string){
    const json1 = state.toJSON()
    try {
        const json2 = JSON.parse(initialData)
        const equal = nodesEqual(json1.root, json2.root)
        return !equal
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


export function countReactions(reactions: {record: {collection: string}}[], c: string){
    return countInArray(reactions, (v) => {return v.record.collection == c})
}


export function countInArray<T>(a: T[], f: (v: T) => boolean): number{
    let c = 0
    a.forEach((v) => {
        if(f(v)) c ++
    })
    return c
}


export function editVisualizationUrl(uri: string) {
    const {did, rkey, collection} = splitUri(uri)
    const collectionParam = collection != "ar.com.cabildoabierto.visualization" ? "&c=" + collection : ""
    return "/nueva-visualizacion?did="+did+"&rkey="+rkey+collectionParam
}


export function articleUrl(title: string, index?: number, changes: boolean = false){
    return "/tema?i=" + encodeURIComponent(title) + (index != undefined ? "&v=" + index : "") + (changes ? "&c=true" : "")
}

export function userUrl(id: string){
    return "/perfil/" + id
}


export function splitUri(uri: string){
    const split = uri.split('/')
    return {
        did: split[2],
        collection: split[3],
        rkey: split[4]
    }
}


export function shortCollectionToCollection(collection: string){
    if(collection == "article"){
        return "ar.com.cabildoabierto.article"
    }
    if(collection == "post"){
        return "app.bsky.feed.post"
    }
    if(collection == "visualization"){
        return "ar.com.cabildoabierto.visualization"
    }
    return collection
}


export function collectionToShortCollection(collection: string){
    if(collection == "ar.com.cabildoabierto.article"){
        return "article"
    }
    if(collection == "app.bsky.feed.post"){
        return "post"
    }
    if(collection == "ar.com.cabildoabierto.visualization"){
        return "visualization"
    }
    return collection
}


export function contentUrl(uri: string, handle?: string){
    const {did, collection, rkey} = splitUri(uri)

    return "/c/" + did + "/" + collectionToShortCollection(collection) + "/" + rkey
}


function getTopicVersionIndex(topicVersion: TopicVersionOnFeedProps){
    const versions = topicVersion.content.topicVersion.topic.versions
    for(let i = 0; i < versions.length; i++){
        if(versions[i].uri == topicVersion.uri){
            return i
        }
    }
}


export function topicVersionUrl(topicVersion: TopicVersionOnFeedProps){
    const index = getTopicVersionIndex(topicVersion)
    return "/tema?i=" + topicVersion.content.topicVersion.topic.id + "&v=" + index
}


export function urlFromRecord(record: {uri: string, collection: string, author: {did: string, handle?: string}}){
    if(record.collection == "ar.com.cabildoabierto.visualization"){
        return "/c/" + record.author.did + "/" + record.collection + "/" + getRkeyFromUri(record.uri)
    } else if(record.collection == "ar.com.cabildoabierto.dataset"){
        return "/c/" + record.author.did + "/" + record.collection + "/" + getRkeyFromUri(record.uri)
    }
    return contentUrl(record.uri, record.author.handle ? record.author.handle : record.author.did)
}


export function getBlueskyUrl(uri: string){
    const {did, collection, rkey} = splitUri(uri)
    return "https://bsky.app/profile/" + did + "/post/" + rkey
}


export function editContentUrl(id: string){
    return "/editar/" + id
}


export function inRange(i, n){
    return i >= 0 && i < n
}


export function isKeyInText(key: string, text: string){
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\/[\\]/g, '\\$&');
    
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
    
    if(regex.test(text)){
        return true
    }
}


export function someKeyInText(keys: string[], text: string){
    return keys.some((k) => (isKeyInText(k, text)), keys)
}


export function getKeysFromEntity(entity: {currentVersion: {synonyms: string[]}, id: string}){
    return [...entity.currentVersion.synonyms, entity.id].map(cleanText)
}


export function findWeakEntityReferences(text: string, searchkeys: {id: string, keys: string[]}[]): {id: string}[]{
    let ids = []
    const cleaned = cleanText(text)

    for(let i = 0; i < searchkeys.length; i++){
        const keys = getKeysFromEntity({
            currentVersion: {synonyms: searchkeys[i].keys},
            id: searchkeys[i].id
        })

        if(someKeyInText(keys, cleaned)){
            ids.push({id: searchkeys[i].id})
        }
    }

    return ids
}


export function getSearchkeysFromEntities(entities: {}[]){
    return []
    /*
    let searchkeys: {id: string, keys: string[]}[] = []

    for(let i = 0; i < entities.length; i++){
        let keys = getKeysFromEntity(entities[i]).map(cleanText)
        searchkeys.push({id: entities[i].id, keys: keys})
    }
    return searchkeys*/
}


function findMentionsInNode(node: any): {id: string}[] {
    let references: {id: string}[] = []
    if(node.type === "custom-beautifulMention"){
        references.push({id: node.data.id})
    }
    if(node.children){
        for(let i = 0; i < node.children.length; i++) {
            const childRefs = findMentionsInNode(node.children[i])
            childRefs.forEach((x) => {references.push(x)})
        }
    }
    return references
}


export function findMentionsFromUsers(text: string, users: SmallUserProps[]){
    
    if(text.length == 0 || text == "Este artículo está vacío!"){
        return []
    }
    let json = null
    try {
        json = JSON.parse(text)
    } catch {
        console.log("failed parsing", text)
    }
    if(!json) return null

    let references: {id: string}[] = findMentionsInNode(json.root)

    references = references.filter(({id}) => (users.some((e) => (e.did == id))))

    return references
}


export function findEntityReferencesFromEntities(text: string, entities: {}[]){
    return []
    /*function findReferencesInNode(node: any): {id: string}[] {
        let references: {id: string}[] = []
        if(node.type === "link"){
            if(node.url.startsWith("/articulo?i=")){
                const id = node.url.split("/articulo?i=")[1]
                references.push({id: id})
            } else if(node.url.startsWith("/articulo/")){
                const id = node.url.split("/articulo/")[1]
                references.push({id: id})
            } else if(node.url.startsWith("/wiki/")){
                const id = node.url.split("/wiki/")[1]
                references.push({id: id})
            }
        }
        if(node.children){
            for(let i = 0; i < node.children.length; i++) {
                const childRefs = findReferencesInNode(node.children[i])
                childRefs.forEach((x) => {references.push(x)})
            }
        }
        return references
    }
    
    if(text.length == 0 || text == "Este artículo está vacío!"){
        return []
    }
    let json = null
    try {
        json  = JSON.parse(text)
    } catch {
        console.log("failed to parse", text)
    }
    if(!json) return []

    let references: {id: string}[] = findReferencesInNode(json.root)

    references = references.filter(({id}) => (entities.some((e) => (e.id == id))))

    return references*/
}


export function entityExists(name: string, entities: {}[]){
    return false
    /*
    name = cleanText(name).replaceAll(" ", "")
    
    for(let i = 0; i < entities.length; i++){
        const clean = cleanText(getTopicTitle(entities[i])).replaceAll(" ", "")
        if(clean == name){
            return true
        }
    }
    return false*/
}


export const shuffleArray = (array) => {
    const newArray = [...array]; // Create a copy of the array
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
    }
    return newArray;
}


export function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');         // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Month is 0-indexed, add 1 and pad
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}


export const launchDate = new Date(2024, 9, 10) // 10 de octubre de 2024


export function validPost(state: EditorState | undefined, charLimit: number, type: string, images: {src: string}[], title?: string){
    if(type == "Post" && (!title || title.length == 0)) return {problem: "no title"}
    if(state != undefined && !emptyOutput(state)){
        if(charLimit){
            const count = charCount(state)
            if(count > charLimit) return {problem: "too many characters"}
        }
        return {}
    } else {
        if(images.length > 0){
            return {}
        } else {
            return {problem: "no state"}
        }
    }
}

export function getTopicMonetizedChars(topic: TopicProps, version: number){
    let monetizedCharsAdded = 0
    for(let i = 0; i <= version; i++){
        if(!isTopicVersionDemonetized(topic.versions[i])){
            monetizedCharsAdded += topic.versions[i].charsAdded
        }
    }
    return monetizedCharsAdded
}


export function getEntityMonetizedContributions(topic: TopicProps, version: number){
    const authors = new Map()
    for(let i = 0; i <= version; i++){
        if(!isTopicVersionDemonetized(topic.versions[i])){
            const author = topic.versions[i].content.record.author.did
            
            if(authors.has(author)){
                authors.set(author, authors.get(author) + topic.versions[i].charsAdded)
            } else {
                authors.set(author, topic.versions[i].charsAdded)
            }
        }
    }
    return Array.from(authors)
}


export const supportDid = "did:plc:rup47j6oesjlf44wx4fizu4m"
export const tomasDid = "did:plc:2356xofv4ntrbu42xeilxjnb"

export const myCookieOptions: SessionOptions = {
    cookieName: 'sid',
    password: process.env.COOKIE_SECRET || "",
    cookieOptions: {
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/"
    }
}


export const formatIsoDate = (isoDate) => {
    const date = new Date(isoDate);
    const argentinaTime = new Intl.DateTimeFormat("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(date);
  
    return argentinaTime;
};


export const emptyChar = <>&nbsp;</>

export const contentContextClassName = "bg-[var(--secondary-light)] px-2 text-sm mx-1 mt-1 link text-[var(--text-light)] rounded "

export function getUsername(user: {displayName?: string, handle: string}){
    return user.displayName ? user.displayName : "@"+user.handle
}


export function getDidFromUri (uri: string) {
    return uri.split("/")[2]
}

export function getRkeyFromUri(uri: string){
    const s = uri.split("/")
    return s[s.length-1]
}

type EntitySearchKeysProps = {
    id: string
    currentVersion: {synonyms: string[]}
}

function findMentionNode(node: any, entity: EntitySearchKeysProps){
    if(node.type == "link" || node.type == "autolink"){
        const url: string = node.url
        if(url.includes("/articulo/") && url.split("/articulo/")[1] == entity.id)
            return node
    }

    if(!node.children) {
        const text = cleanText(getAllText(node))
        if(someKeyInText(getKeysFromEntity(entity), text)){
            return node
        } else {
            return null
        }
    }
    for(let i = 0; i < node.children.length; i++){
        const found = findMentionNode(node.children[i], entity)
        if(found) return found
    }
}


function findMentionAncestors(node: any, entity: EntitySearchKeysProps){
    if(!node.children){
        return [node]
    }
    for(let i = 0; i < node.children.length; i++){
        const mentionNode = findMentionNode(node.children[i], entity)
        if(mentionNode){
            return [node, ...findMentionAncestors(node.children[i], entity)]
        }
    }
    return [node]
}


function findFragment(text: string, entity: EntitySearchKeysProps){
    const parsed = JSON.parse(text)
    const mentionNode = findMentionNode(parsed.root, entity)
    if(!mentionNode){
        return "Parece haber una mención pero no la encontramos"
    }
    const ancestors = findMentionAncestors(parsed.root, entity)
    let best = null
    let bestFitness = null
    for(let i = 0; i < ancestors.length; i++){
        const fitness = Math.abs(getAllText(ancestors[i]).length - 80)
        if(!best || fitness < bestFitness){
            best = ancestors[i]
            bestFitness = fitness
        }
    }
    return getAllText(best)
}


export function getVisualizationTitle(v: {visualization: {spec: string}}){
    const spec = JSON.parse(v.visualization.spec)
    return spec.title.text
}


export function uriToEndpoint(uri: string){
    return uri.replace("at:/", "")
}


export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100 && !name.includes("/");
}

export const ErrorMsg = ({text}: {text: string}) => {
    return <div className="text-red-600 text-sm">
        {text}
    </div>
}

export function pxToNumber(x: string): number {
    return parseInt(x, 10);
}


export const PrettyJSON = ({ data }: { data: any }) => {
    return (
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
    );
};

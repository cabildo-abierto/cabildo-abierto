import assert from "assert"
import { UserProps, EntityProps, SmallEntityProps } from "../app/lib/definitions"
import { charDiffFromJSONString } from "./diff"
import { db } from "../db"


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


export function validSubscription(user: UserProps | undefined){
    if(!user) return false
    if(user.subscriptionsUsed.length == 0) return false

    const lastPaymentDate = new Date(user.subscriptionsUsed[user.subscriptionsUsed.length-1].usedAt as Date | string)
    const nextSubscriptionEnd = new Date(lastPaymentDate)
    
    nextSubscriptionEnd?.setMonth(lastPaymentDate.getMonth()+1)
    
    return nextSubscriptionEnd > new Date()
}


export const entityLastVersionId = (entity: EntityProps) => {
    return entity.versions[entity.versions.length-1].id
}


export function sumFromFirstEdit(values: number[], entity: EntityProps, userId: string) {
    let total = 0
    let firstEdit = 0
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].authorId == userId){
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


export const monthly_visits_limit = 0


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
            charDiffFromJSONString(entity.versions[j-1].text, entity.versions[j].text)
        
        accCharsAdded += charsAdded
        
        const author = entity.versions[j].authorId
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
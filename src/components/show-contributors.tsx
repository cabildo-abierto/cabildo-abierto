import Link from "next/link"
import { useEntity } from "../app/hooks/entities"
import { currentVersion, isDemonetized } from "./utils"
import { Button, IconButton } from "@mui/material"
import { AuthorshipClaimIcon } from "./icons"
import { useState } from "react"
import { EntityProps } from "../app/lib/definitions"



function round2(x: number){
    return Math.round(x * 100) / 100
}


export function toPercentage(chars: number, total: number){
    if(total == 0) return <></>
    return round2(chars / total * 100)
}


export const ShowUserContribution = ({entityId, userId}: 
    {entityId: string, userId?: string}) => {
    const {entity, isLoading} = useEntity(entityId)

    if(isLoading) return <></>

    const lastVersion = entity.versions[currentVersion(entity)]
    const firstVersion = entity.versions[0]
    
    if(lastVersion.accCharsAdded == 0){
        return <div className="flex">
            <span className="mr-1">Creado por</span>
            <div className="flex space-x-2 link">
                <Link href={"/perfil/"+firstVersion.author.id}>@{firstVersion.author.id}</Link>
            </div>.
        </div>
    }

    let contributions: [string, number][] = JSON.parse(lastVersion.contribution)
    
    const total = lastVersion.accCharsAdded

    contributions = contributions.filter(([authorId, _]) => (authorId == userId))

    if(contributions.length > 0)
        return <span>
            Contribución: {toPercentage(contributions[0][1], total)}%
        </span>
    else {
        return <span>Contribución: Tema vacío</span>
    }
}


export function getEntityMonetizedChars(entity: EntityProps, version: number){
    let monetizedCharsAdded = 0
    for(let i = 0; i <= version; i++){
        if(!isDemonetized(entity.versions[i])){
            monetizedCharsAdded += entity.versions[i].charsAdded
        }
    }
    return monetizedCharsAdded
}


export function getEntityMonetizedContributions(entity: EntityProps, version: number){
    const authors = new Map()
    for(let i = 0; i <= version; i++){
        if(!isDemonetized(entity.versions[i])){
            const author = entity.versions[i].author.id
            
            if(authors.has(author)){
                authors.set(author, authors.get(author) + entity.versions[i].charsAdded)
            } else {
                authors.set(author, entity.versions[i].charsAdded)
            }
        }
    }
    return Array.from(authors)
}


export const ShowContributors = ({entityId, userId}: 
    {entityId: string, userId?: string}) => {
    const {entity, isLoading} = useEntity(entityId)
    const [monetized, setMonetized] = useState(false)

    if(isLoading) return <></>

    const lastVersion = entity.versions[entity.versions.length-1]
    const firstVersion = entity.versions[0]

    if(lastVersion.accCharsAdded == 0){
        return <div className="flex">
            <span className="mr-1">Creado por</span>
            <div className="flex space-x-2 link">
                <Link href={"/perfil/"+firstVersion.author.id}>@{firstVersion.author.id}</Link>
            </div>.
        </div>
    }

    let contributions: [string, number][] = JSON.parse(lastVersion.contribution)

    if(contributions == null){
        return <></>
    }

    function comp(a, b){
        return b[1] - a[1]
    }

    let total = lastVersion.accCharsAdded
    if(monetized){
        contributions = getEntityMonetizedContributions(entity, entity.versions.length-1)
        total = getEntityMonetizedChars(entity, entity.versions.length-1)
    }

    contributions = contributions.sort(comp)

    return <div className="mt-2">
        {contributions.length == 0 && <div className="text-[var(--text-light)] text-sm">Ningún autor</div>}
        {contributions.length > 0 && <div className="flex">
            <div className="flex flex-wrap space-x-2 link">
                {contributions.map(([authorId, chars], index) => {
                    return <span key={index}><Link href={"/perfil/"+authorId}>@{authorId}</Link> ({toPercentage(chars, total)}%)</span>
                })}.
            </div>
        </div>}
        <div className="flex justify-end text-[var(--text-light)]">
        <Button
            onClick={() => {setMonetized(!monetized)}}
            size="small"
            color="inherit"
            sx={{textTransform: "none"}}
        >
            {monetized ? "todo" : "monetizado"}
        </Button>
        </div>
    </div>
}
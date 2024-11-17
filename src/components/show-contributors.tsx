
import { CustomLink as Link } from './custom-link';
import { useEntity } from "../app/hooks/entities"
import { currentVersion, getEntityMonetizedChars, getEntityMonetizedContributions } from "./utils"
import { Button } from "@mui/material"
import { useState } from "react"
import { BothContributionsProps } from "../actions/entities"
import { ContributionsProps } from "../app/lib/definitions"



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

    let contributions: [string, number][] = JSON.parse(lastVersion.contribution).monetized
    
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

    let contributions: ContributionsProps
    try {
        let contributionsBoth: BothContributionsProps = JSON.parse(lastVersion.contribution)
        contributions = monetized ? contributionsBoth.monetized : contributionsBoth.all
    } catch {
        return <></>
    }

    if(contributions == null){
        return <></>
    }

    function comp(a, b){
        return b[1] - a[1]
    }

    let total = lastVersion.accCharsAdded
    if(monetized){
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
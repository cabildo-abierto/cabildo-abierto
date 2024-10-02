import Link from "next/link"
import { useEntity } from "../app/hooks/entities"



function round2(x: number){
    return Math.round(x * 100) / 100
}


function toPercentage(chars: number, total: number){
    if(total == 0) return <></>
    return <span>({round2(chars / total * 100)}%)</span>
}


export const ShowUserContribution = ({entityId, userId}: 
    {entityId: string, userId?: string}) => {
    const {entity, isLoading} = useEntity(entityId)

    if(isLoading) return <></>

    const lastVersion = entity.versions[entity.versions.length-1]

    if(lastVersion.accCharsAdded == 0){
        return <div className="flex">
            <span className="mr-1">Creado por</span>
            <div className="flex space-x-2 link">
                <Link href={"/perfil/"+lastVersion.authorId}>@{lastVersion.authorId}</Link>
            </div>.
        </div>
    }

    let contributions: [string, number][] = JSON.parse(lastVersion.contribution)
    
    const total = lastVersion.accCharsAdded

    contributions = contributions.filter(([authorId, _]) => (authorId == userId))

    if(contributions.length > 0)
        return <span>Contribución: {round2(contributions[0][1] / total * 100)}%</span>
    else {
        return <span>Contribución: Artículo vacío</span>
    }
}


export const ShowContributors = ({entityId, userId}: 
    {entityId: string, userId?: string}) => {
    const {entity, isLoading} = useEntity(entityId)

    if(isLoading) return <></>

    const lastVersion = entity.versions[entity.versions.length-1]

    if(lastVersion.accCharsAdded == 0){
        return <div className="flex">
            <span className="mr-1">Creado por</span>
            <div className="flex space-x-2 link">
                <Link href={"/perfil/"+lastVersion.authorId}>@{lastVersion.authorId}</Link>
            </div>.
        </div>
    }

    let contributions: [string, number][] = JSON.parse(lastVersion.contribution)
    
    const total = lastVersion.accCharsAdded

    if(contributions == null){
        return <></>
    }

    return <div className="flex">
        <span className="mr-1">Escrito por</span>
        <div className="flex space-x-2 link">
            {contributions.map(([authorId, chars], index) => {
                return <span key={index}><Link href={"/perfil/"+authorId}>@{authorId}</Link> {toPercentage(chars, total)}</span>
            })}.
        </div>
    </div>
}
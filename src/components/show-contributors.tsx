import Link from "next/link";
import { useContributions } from "src/app/hooks/entities";


function round2(x: number){
    return Math.round(x * 100) / 100
}


export const ShowContributors = ({entityId, version, userId}: 
    {entityId: string, version?: number, userId?: string}) => {
    const contributions = useContributions(entityId)
    if(contributions.isLoading) return <></>
    
    if(contributions.contributions.length == 0) return <></>
    if(version == undefined) version = contributions.contributions.length-1
    if(version >= contributions.contributions.length) return <></>
    let versionContr = contributions.contributions[version]
    if(version == 0) return <></>
    
    let total = 0
    versionContr.forEach(([authorId, chars]) => {total += chars})

    if(userId)
        versionContr = versionContr.filter(([authorId, _]) => (authorId == userId))

    if(userId){
        return <span>Contribución: {round2(versionContr[0][1] / total * 100)}%</span>
    }

    return <div className="flex">
        <span className="mr-1">Escrito por</span>
    <div className="flex space-x-2 link">
        {versionContr.map(([authorId, chars], index) => {
            return <span key={index}><Link href={"/perfil/"+authorId}>@{authorId}</Link> ({round2(chars / total * 100)}%)</span>
        })}
    </div>
    </div>
}
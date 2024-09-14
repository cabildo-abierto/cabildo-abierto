import Link from "next/link"
import { useContent } from "../app/hooks/contents"



function round2(x: number){
    return Math.round(x * 100) / 100
}


export const ShowContributors = ({contentId, userId}: 
    {contentId: string, userId?: string}) => {
    const content = useContent(contentId)
    if(content.isLoading) return <></>
    if(!content.content.contribution){
        return <></>
    }

    if(content.content.accCharsAdded == 0){
        return <div className="flex">
        <span className="mr-1">Creado por</span>
            <div className="flex space-x-2 link">
                <Link href={"/perfil/"+content.content.author.id}>@{content.content.author.id}</Link>
            </div>
        </div>
    }

    let contributions: [string, number][] = JSON.parse(content.content.contribution)
    
    const total = content.content.accCharsAdded

    if(userId) // para el panel de estadísticas
        contributions = contributions.filter(([authorId, _]) => (authorId == userId))

    if(userId){
        if(contributions.length > 0)
            return <span>Contribución: {round2(contributions[0][1] / total * 100)}%</span>
        else {
            return <span>Contribución: Artículo vacío</span>
        }
    }

    function toPercentage(chars: number, total: number){
        if(total == 0) return <></>
        return <span>({round2(chars / total * 100)}%)</span>
    }

    return <div className="flex">
        <span className="mr-1">Escrito por</span>
    <div className="flex space-x-2 link">
        {contributions.map(([authorId, chars], index) => {
            return <span key={index}><Link href={"/perfil/"+authorId}>@{authorId}</Link> {toPercentage(chars, total)}</span>
        })}
    </div>
    </div>
}
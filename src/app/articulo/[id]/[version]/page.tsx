import { headers } from "next/headers"
import { getContentById } from "../../../../actions/contents"
import { getEntityById } from "../../../../actions/entities"
import { getUserId, logVisit } from "../../../../actions/users"
import { ArticlePage } from "../../../../components/article-page"
import NoEntityPage from "../../../../components/no-entity-page"
import { ThreeColumnsLayout } from "../../../../components/three-columns"
import { userAgent } from "next/server"
import { visitsThisMonth, monthly_visits_limit } from "../../../../components/utils"



const Page = async ({params}: {params: {id: string, version: string}}) => {
    const entity = await getEntityById(params.id)
    if(!entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id}/>}/>
    }
    
    const userId = await getUserId()
    const version = Number(params.version)
    const content = await getContentById(entity.versions[version].id, userId)

    const header = headers()
    const user = userAgent({headers: header})

    let visitOK = true
    if(!userId && !entity.isPublic){
        const noAccountUser = await logVisit(header, user, content.id)
        const visits = visitsThisMonth(noAccountUser.visits)
        if(visits >= monthly_visits_limit){
            visitOK = false
        }
    }

    if(Number(params.version) !== null){
        return <ArticlePage entity={entity} content={content} version={version} visitOK={visitOK}/>
    } else {
        return <>Versión del artículo no encontrada</>
    }
}

export default Page
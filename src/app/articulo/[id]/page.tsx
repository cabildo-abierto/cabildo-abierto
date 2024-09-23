import { getContentById } from "../../../actions/contents"
import { getEntityById } from "../../../actions/entities"
import { getUserId, logVisit } from "../../../actions/users"
import { ArticlePage } from "../../../components/article-page"
import NoEntityPage from "../../../components/no-entity-page"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { headers } from 'next/headers'
import { userAgent } from 'next/server'
import { monthly_visits_limit, visitsThisMonth } from "../../../components/utils"


const Page = async ({params}: {params: {id: string}}) => {
    const entity = await getEntityById(params.id)
    if(!entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id}/>}/>
    }

    const header = headers()
    const user = userAgent({headers: header})

    const userId = await getUserId()
    const version = entity.versions.length-1
    const content = await getContentById(entity.versions[version].id, userId)

    let visitOK = true
    if(!userId && !entity.isPublic){
        const noAccountUser = await logVisit(header, user, content.id)
        const visits = visitsThisMonth(noAccountUser.visits)
        if(visits >= monthly_visits_limit){
            visitOK = false
        }
    }

    return <ArticlePage entity={entity} content={content} version={undefined} visitOK={visitOK}/>
}

export default Page
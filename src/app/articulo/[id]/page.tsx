import { getContentById } from "../../../actions/contents"
import { getEntityById } from "../../../actions/entities"
import { getUserId } from "../../../actions/users"
import { ArticlePage } from "../../../components/article-page"
import NoEntityPage from "../../../components/no-entity-page"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { headers } from 'next/headers'


const Page = async ({params}: {params: {id: string}}) => {
    const entity = await getEntityById(params.id)
    if(!entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id}/>}/>
    }
    
    const header = headers()
    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    console.log("IP", ip, "read entity", params.id)
    
    const userId = await getUserId()
    const version = entity.versions.length-1
    const content = await getContentById(entity.versions[version].id, userId)

    return <ArticlePage entity={entity} content={content} version={version}/>
}

export default Page
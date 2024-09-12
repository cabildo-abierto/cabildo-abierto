import { getContentById } from "../../../../actions/contents"
import { getEntityById } from "../../../../actions/entities"
import { getUserId } from "../../../../actions/users"
import { ArticlePage } from "../../../../components/article-page"
import NoEntityPage from "../../../../components/no-entity-page"
import { ThreeColumnsLayout } from "../../../../components/three-columns"



const Page = async ({params}: {params: {id: string, version: string}}) => {
    const entity = await getEntityById(params.id)
    if(!entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id}/>}/>
    }
    
    const userId = await getUserId()
    const version = Number(params.version)
    const content = await getContentById(entity.versions[version].id, userId)


    if(Number(params.version) !== null){
        return <ArticlePage entity={entity} content={content} version={version}/>
    } else {
        return <>Versión del artículo no encontrada</>
    }
}

export default Page
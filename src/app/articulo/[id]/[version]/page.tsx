import { ArticlePage } from "@/components/article-page"




const Page = ({params}: {params: {id: string, version: string}}) => {
    if(Number(params.version) !== null){
        return <ArticlePage entityId={params.id} version={Number(params.version)}/>
    } else {
        return <>Versión del artículo no encontrada</>
    }
    
}

export default Page
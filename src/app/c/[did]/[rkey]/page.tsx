import {getThread} from "../../../../actions/contents";
import {Thread} from "../../../../components/feed/thread";
import { NotFoundPage } from "../../../../components/not-found-page";


export async function generateMetadata({searchParams}: {searchParams: {i: string}}){
    return null
    /*const {content} = await getContentById(searchParams.i)
    if(!content){
        return {
            title: "Contenido no encontrado",
            description: ""
        }
    }

    const description = "Publicación de @" + content.author.id + " en Cabildo Abierto"

    if(content.type == "Post"){
        return {title: content.title,
            description
        }
    }

    if(content.type == "FastPost"){
        return {
            title: "Publicación rápida de @" + content.author.id,
            description
        }
    }

    if(content.type == "Comment"){
        return {
            title: "Comentario de @" + content.author.id,
            description
        }
    }

    if(content.type == "FakeNewsReport"){
        return {
            title: "Reporte de @" + content.author.id,
            description
        }
    }

    return {}*/
}


const ContentPage: React.FC<{params: {did: string, rkey: string}}> = async ({params}) => {
    
    const {thread} = await getThread({did: decodeURIComponent(params.did), rkey: params.rkey})

    if(!thread){
        return <NotFoundPage/>
    }

    return <Thread thread={thread}/>
}

export default ContentPage

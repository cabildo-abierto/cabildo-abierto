import { ThreeColumnsLayout } from "../../components/three-columns";
import {getThread} from "../../actions/contents";
import {Thread} from "../../components/feed/thread";
import { NotFoundPage } from "../../components/not-found-page";


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


const ContentPage: React.FC<{searchParams: {i: string, u: string, c: string}}> = async ({searchParams}) => {
    
    const {thread} = await getThread(searchParams.u, searchParams.i, searchParams.c)

    if(!thread){
        return <NotFoundPage/>
    }

    const center = <Thread thread={thread}/>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage

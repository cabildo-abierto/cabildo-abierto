import { ThreeColumnsLayout } from "../../components/three-columns";
import { getATProtoThread, getContentById } from "../../actions/contents";
import { ATProtoFastPost } from "../../components/atproto-fast-post";
import { FeedContentProps } from "../lib/definitions";


export async function generateMetadata({searchParams}: {searchParams: {i: string}}){
    return null
    const {content} = await getContentById(searchParams.i)
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

    return {}
}


const ContentPage: React.FC<{searchParams: {i: string, u: string}}> = async ({searchParams}) => {
    console.log("user", searchParams.u, "i", searchParams.i)

    const thread = await getATProtoThread(searchParams.u, searchParams.i)

    console.log("post", thread.post)

    const center = <div>
        <ATProtoFastPost content={thread.post as FeedContentProps}/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage

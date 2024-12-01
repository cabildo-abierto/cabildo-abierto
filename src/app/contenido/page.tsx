import { ThreeColumnsLayout } from "../../components/three-columns";
import { getATProtoThread } from "../../actions/contents";
import { ATProtoFastPost } from "../../components/feed/atproto-fast-post";
import { FeedContentProps } from "../lib/definitions";
import { ATProtoArticle } from "../../components/feed/atproto-article";
import { BlockedPost, NotFoundPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { ATProtoThread } from "./thread";


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


export type ThreadProps = ThreadViewPost | FeedContentProps


const ContentPage: React.FC<{searchParams: {i: string, u: string, c: string}}> = async ({searchParams}) => {
    
    const content: ThreadProps | null = await getATProtoThread(searchParams.u, searchParams.i, searchParams.c)

    let center
    if('post' in content){
        center = <ATProtoThread thread={content}/>
    } else {
        center = <ATProtoArticle content={content as FeedContentProps}/>
    }

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage

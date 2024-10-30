import React from "react";
import { ContentWithCommentsFromId } from "../../components/content-with-comments";
import { ThreeColumnsLayout } from "../../components/three-columns";
import { getContentById } from "../../actions/contents";


export async function generateMetadata({searchParams}: {searchParams: {i: string}}){
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


const ContentPage: React.FC<{searchParams: {i: string}}> = async ({searchParams}) => {
    const center = <div className="flex flex-col h-full">
        <div className="mt-8">
            <ContentWithCommentsFromId
                contentId={searchParams.i}
                isMainPage={true}
                inCommentSection={false}
            />
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ContentPage

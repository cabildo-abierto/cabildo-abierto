"use client"

import React from "react";
import { useContent } from "../../hooks/contents";
import LoadingSpinner from "../../../components/loading-spinner";
import { ErrorPage } from "../../../components/error-page";
import { ThreeColumnsLayout } from "../../../components/three-columns";
import { decompress } from "../../../components/compression";
import PostEditor from "../../../components/editor/post-editor";
import { useUser } from "../../hooks/user";
import { ContentProps } from "../../lib/definitions";


function canEdit(content: ContentProps){
    if(content.type == "EntityContent"){
        return false
    } else if(content.type == "Comment"){
        return true
    } else if(content.type == "FakeNewsReport"){
        return true
    } else if(content.type == "UndoEntityContent"){
        return false
    } else if(content.type == "FastPost"){
        return true
    } else if(content.type == "Post"){
        return true
    }
}


const Editar: React.FC<any> = ({params}) => {
    const {content, isLoading, isError} = useContent(params.id)
    const {user} = useUser()

    if(isLoading){
        return <LoadingSpinner/>
    }
    if(isError || !content){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }
    
    if(!user || content.author.id != user.id){
        return <ErrorPage>No sos el autor de este contenido</ErrorPage>
    }

    if(!canEdit(content)){
        return <ErrorPage>No es posible editar este contenido</ErrorPage>
    }

    const center = <PostEditor
        initialData={decompress(content.compressedText)}
        initialTitle={content.title ? content.title : undefined}
        isFast={content.type == "FastPost"}
        contentId={content.id}
        isPublished={!content.isDraft}
    />

    return <ThreeColumnsLayout center={center}/>
};

export default Editar;


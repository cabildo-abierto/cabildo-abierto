"use client"

import React from "react";
import { ThreeColumnsLayout } from "src/components/three-columns";
import EditDraftPage from "./edit-draft";
import { ErrorPage } from "src/components/error-page";
import { useContent } from "src/app/hooks/contents";
import LoadingSpinner from "src/components/loading-spinner";


const Editar: React.FC<any> = ({params}) => {
    const {content, isLoading, isError} = useContent(params.id)

    if(isLoading){
        return <LoadingSpinner/>
    }
    if(isError || !content){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }

    const center = <EditDraftPage content={content}/>

    return <ThreeColumnsLayout center={center}/>
};

export default Editar;


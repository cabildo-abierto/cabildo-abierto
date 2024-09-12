"use client"

import React from "react";
import EditDraftPage from "./edit-draft";
import { useContent } from "../../hooks/contents";
import LoadingSpinner from "../../../components/loading-spinner";
import { ErrorPage } from "../../../components/error-page";
import { ThreeColumnsLayout } from "../../../components/three-columns";


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


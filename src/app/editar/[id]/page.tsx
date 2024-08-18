"use client"

import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import EditDraftPage from "./edit-draft";
import { ErrorPage } from "@/components/error-page";
import { useContent } from "@/app/hooks/contents";


const Editar: React.FC<any> = ({params}) => {
    const {content, isLoading, isError} = useContent(params.id)

    if(isLoading){
        return <>Cargando...</>
    }
    if(isError || !content){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }

    const center = <EditDraftPage content={content}/>

    return <ThreeColumnsLayout center={center}/>
};

export default Editar;


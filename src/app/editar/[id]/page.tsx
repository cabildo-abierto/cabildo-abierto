"use client"
import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import EditDraftPage from "./edit-draft";
import { requireSubscription } from "@/components/utils";
import { ErrorPage } from "@/components/error-page";
import { useContents } from "@/components/use-contents";


const Editar: React.FC<any> = ({params}) => {
    const {contents, setContents} = useContents()
    let center = <></>
    if(!contents) {
        center = <div>Cargando...</div>
    } else {
        const content = contents[params.id]
        if(!content){
            return center = <ErrorPage>No se encontró el contenido</ErrorPage>
        }
        center = <EditDraftPage content={content}/>
    }

    return requireSubscription(<ThreeColumnsLayout center={center}/>, true)
};

export default Editar;


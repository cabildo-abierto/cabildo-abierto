import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import EditDraftPage from "./edit-draft";
import { ErrorPage } from "@/components/error-page";
import { getContentById } from "@/actions/get-content";


const Editar: React.FC<any> = async ({params}) => {
    const content = await getContentById(params.id)

    if(!content){
        return <ErrorPage>No se encontró el contenido</ErrorPage>
    }

    const center = <EditDraftPage content={content}/>

    return <ThreeColumnsLayout center={center}/>
};

export default Editar;


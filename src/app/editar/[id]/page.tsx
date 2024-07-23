import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getContentById } from "@/actions/get-content";
import EditDraftPage from "./edit-draft";
import { requireSubscription } from "@/components/utils";
import { getUserId } from "@/actions/get-user";
import { ErrorPage } from "@/components/error-page";


const Editar: React.FC<any> = async ({params}) => {
    const content = await getContentById(params.id, await getUserId())
    if(!content || !content.content){
        return <ErrorPage>No se pudo cargar el contenido</ErrorPage>
    }

    return requireSubscription(<ThreeColumnsLayout center={<EditDraftPage content={content.content}/>}/>, true)
};

export default Editar;


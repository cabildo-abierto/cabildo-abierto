import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getContentById } from "@/actions/get-content";
import EditDraftPage from "./edit-draft";
import { requireSubscription } from "@/components/utils";
import { getUserId } from "@/actions/get-user";


const Editar: React.FC = async ({params}) => {
    const content = await getContentById(params.id, await getUserId())

    return requireSubscription(<ThreeColumnsLayout center={<EditDraftPage content={content.content}/>}/>, true)
};

export default Editar;


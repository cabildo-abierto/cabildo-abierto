import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getContentById } from "@/actions/get-content";
import EditDraftPage from "./edit-draft";


const Editar: React.FC = async ({params}) => {
    const content = await getContentById(params.id)

    return <ThreeColumnsLayout center={<EditDraftPage content={content}/>}/>
};

export default Editar;


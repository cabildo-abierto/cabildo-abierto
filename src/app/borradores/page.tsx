"use client"

import React from "react";
import { ThreeColumnsLayout } from "@/components/three-columns";
import { useDrafts } from "../hooks/contents";
import { DraftButton } from "@/components/draft-button";
import { useUser } from "../hooks/user";
import { DraftsPreview } from "../../components/drafts-preview";


const Drafts: React.FC = () => {
    const user = useUser()
    if(user.isLoading){
        return <></>
    }
    if(user.isError || !user.user){
        return <>Necesitás una cuenta para ver esta página</>
    }
    
    const center = <>
        <div className="py-4"><h1>Borradores</h1></div>
        <DraftsPreview user={user.user}/>
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;


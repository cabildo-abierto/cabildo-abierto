"use client"

import React from "react";
import { ThreeColumnsLayout } from "@/components/three-columns";
import { useUser } from "../hooks/user";
import { DraftsPreview } from "../../components/drafts-preview";


const Drafts: React.FC = () => {
    const {user} = useUser()
    
    const center = <>
        <div className="py-4"><h1>Borradores</h1></div>
        <DraftsPreview user={user}/>
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;


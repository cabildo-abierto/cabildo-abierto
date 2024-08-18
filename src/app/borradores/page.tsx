"use client"

import React from "react";
import { ThreeColumnsLayout } from "@/components/three-columns";
import { useDrafts } from "../hooks/contents";
import { DraftButton } from "@/components/draft-button";
import { useUser } from "../hooks/user";
import { DraftsPreview } from "../../components/drafts-preview";
import { UserProps } from "../lib/definitions";

export type LoadingUser = {
    user: UserProps,
    isLoading: boolean,
    isError: boolean
}

const Drafts: React.FC = () => {
    const {user} = useUser()
    
    const center = <>
        <div className="py-4"><h1>Borradores</h1></div>
        <DraftsPreview user={user}/>
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;


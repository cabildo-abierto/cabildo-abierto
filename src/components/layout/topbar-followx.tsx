import {BackButton} from "./utils/back-button";
import React from "react";
import {useParams} from "next/navigation";


export const TopbarFollowx = () => {
    const params = useParams()
    const id = params.id

    return <div className={"flex space-x-2 h-full items-center"}>
        <BackButton
            defaultURL={`/perfil/${id.toString()}`}
            behavior={"fixed"}
        />
        <div className={"font-bold text-lg"}>
            @{id}
        </div>
    </div>
}
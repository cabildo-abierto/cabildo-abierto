"use client"


import {AdminSection} from "@/components/admin/admin-section";
import {useState} from "react";
import {TextField} from "@mui/material";
import {post} from "@/utils/fetch";
import StateButton from "../../../modules/ui-utils/src/state-button";

export const AdminPrincipal = () => {
    const [route, setRoute] = useState("")

    async function onSendPost(){
        await post<{}, {}>(route)
        return {}
    }

    const suggestions = [
        "job/update-topics-categories",
        "job/update-topics-popularity",
        "job/update-categories-graph",
        "job/update-references",
        "job/update-topic-contributions",
        "job/create-user-months",
        "job/batch-jobs",
        "job/update-bsky-followers",
        "job/restart-interactions-last-update",
        "job/restart-references-last-update",
        "job/restart-interactions-last-update",
        "job/sync-all-users"
    ]

    return <div className={"pt-16 space-y-8"}>
        <AdminSection title="Enviar POST">
            <div className={"flex space-x-4 justify-center"}>
                <TextField
                    label={"Ruta"}
                    value={route}
                    size={"small"}
                    onChange={(e) => {setRoute(e.target.value)}}
                />
                <StateButton handleClick={onSendPost} text1={"Enviar"}/>
            </div>
            <div className={"space-y-2"}>
                <div className={"text-[var(--text-light)]"}>
                    Sugerencias
                </div>
                <div className={"space-y-2 flex flex-col pb-2 font-mono"}>
                    {suggestions.map((s, i) => {
                        return <div
                            key={i}
                            className={"p-2 bg-[var(--background-dark)] hover:bg-[var(--background-dark2)] rounded cursor-pointer"}
                            onClick={() => {setRoute(`/${s}`)}}
                        >
                            {s}
                        </div>
                    })}
                </div>
            </div>
        </AdminSection>
    </div>
}
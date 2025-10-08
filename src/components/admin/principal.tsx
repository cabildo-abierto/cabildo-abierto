"use client"


import {AdminSection} from "@/components/admin/admin-section";
import {useState} from "react";
import {post} from "@/utils/fetch";
import StateButton from "../../../modules/ui-utils/src/state-button";
import { TextField } from "../../../modules/ui-utils/src/text-field";
import {useAPI} from "@/queries/utils";

function useRegisteredJobs() {
    return useAPI<string[]>("/registered-jobs", ["registered-jobs"])
}

export const AdminPrincipal = () => {
    const [route, setRoute] = useState("")
    const {data} = useRegisteredJobs()

    async function onSendPost(){
        await post<{}, {}>(route)
        return {}
    }

    return <div className={"pt-16 space-y-8 pb-16"}>
        <AdminSection title="Enviar POST">
            <div className={"flex space-x-4 justify-center"}>
                <TextField
                    label={"Ruta"}
                    value={route}
                    size={"small"}
                    onChange={(e) => {setRoute(e.target.value)}}
                />
                <StateButton variant="outlined" handleClick={onSendPost} text1={"Enviar"}/>
            </div>
            <div className={"space-y-2"}>
                <div className={"space-y-2 flex flex-col pb-2 font-mono"}>
                    {data && data.map((s, i) => {
                        return <div
                            key={i}
                            className={"px-2 py-1 panel hover:bg-[var(--background-dark)] text-sm cursor-pointer"}
                            onClick={() => {setRoute(`/job/${s}`)}}
                        >
                            {`/job/${s}`}
                        </div>
                    })}
                </div>
            </div>
        </AdminSection>
    </div>
}
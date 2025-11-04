"use client"


import {AdminSection} from "@/components/admin/admin-section";
import {useState} from "react";
import {post} from "@/utils/fetch";
import StateButton from "../layout/utils/state-button";
import {useAPI} from "@/queries/utils";
import {unique} from "@/utils/arrays";
import BaseTextFieldWithSuggestions from "@/components/layout/base/base-text-field-with-suggestions";

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
                <BaseTextFieldWithSuggestions
                    className={"w-64"}
                    label={"Ruta"}
                    value={route}
                    options={unique(data).map(d => `/job/${d}`)}
                    onChange={(e) => {setRoute(e)}}
                />
                <StateButton
                    variant="outlined"
                    handleClick={onSendPost}
                >
                    Enviar
                </StateButton>
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
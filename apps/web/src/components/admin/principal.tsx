"use client"


import {AdminSection} from "./admin-section";
import {useState} from "react";
import {post} from "../utils/react/fetch";
import {StateButton} from "@/components/utils/base/state-button"
import {useAPI} from "@/components/utils/react/queries";
import {unique} from "@cabildo-abierto/utils";
import {BaseTextFieldWithSuggestions} from "@/components/utils/base/base-text-field-with-suggestions";

function useRegisteredJobs() {
    return useAPI<string[]>("/registered-jobs", ["registered-jobs"])
}

export const AdminPost = () => {
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
                <div className={"space-y-2 flex flex-col items-center pb-2 font-mono"}>
                    {data && data.map((s, i) => {
                        return <div
                            key={i}
                            className={"px-2 py-1 panel hover:bg-[var(--background-dark)] text-sm cursor-pointer w-[360px]"}
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
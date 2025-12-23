"use client"


import {AdminSection} from "./admin-section";
import {useState} from "react";
import {get, post} from "../utils/react/fetch";
import {StateButton} from "@/components/utils/base/state-button"
import {useAPI} from "@/components/utils/react/queries";
import {unique} from "@cabildo-abierto/utils";
import {BaseTextFieldWithSuggestions} from "@/components/utils/base/base-text-field-with-suggestions";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {PrettyJSON} from "@/components/utils/pretty-json";

function useRegisteredJobs() {
    return useAPI<string[]>("/registered-jobs", ["registered-jobs"])
}

export const AdminPost = () => {
    const [POSTRoute, setPOSTRoute] = useState("")
    const [GETRoute, setGETRoute] = useState("")
    const {data} = useRegisteredJobs()
    const [GETReqResult, setGETReqResult] = useState<{error?: string, data?: any} | null | "loading">(null)

    async function onSendPost(){
        await post<{}, {}>(POSTRoute)
        return {}
    }

    async function onSendGet() {
        setGETReqResult("loading")
        const res = await get<any>(GETRoute)
        setGETReqResult(res)
        return {}
    }

    return <div className={"pt-16 space-y-8 pb-16"}>
        <AdminSection title="Enviar POST">
            <div className={"flex space-x-4 justify-center"}>
                <BaseTextFieldWithSuggestions
                    className={"w-64"}
                    label={"Ruta"}
                    value={POSTRoute}
                    options={unique(data).map(d => `/job/${d}`)}
                    onChange={(e) => {setPOSTRoute(e)}}
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
                            onClick={() => {setPOSTRoute(`/job/${s}`)}}
                        >
                            {`/job/${s}`}
                        </div>
                    })}
                </div>
            </div>
        </AdminSection>

        <AdminSection title="Enviar GET">
            <div className={"flex space-x-4 justify-center"}>
                <BaseTextField
                    className={"w-64"}
                    label={"Ruta"}
                    value={GETRoute}
                    onChange={(e) => {
                        setGETRoute(e.target.value)
                    }}
                />
                <StateButton
                    variant="outlined"
                    handleClick={onSendGet}
                >
                    Enviar
                </StateButton>
            </div>
            <div className={"flex flex-col items-center"}>
                <div>
                    Resultado:
                </div>
                <div>
                    {GETReqResult && <PrettyJSON data={GETReqResult}/>}
                </div>
            </div>
        </AdminSection>
    </div>
}
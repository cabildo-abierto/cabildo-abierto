"use client"
import {UploadFileButton} from "@/components/utils/upload-file-button";
import {useState} from "react";
import {ArCabildoabiertoWikiTopicVersion, BatchEdit, EditPropsParams} from "@cabildo-abierto/api";
import {TopicPropView} from "@/components/tema/props/topic-prop-view";
import {post} from "@/components/utils/react/fetch";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {useErrors} from "@/components/layout/contexts/error-context";
import {toast} from "sonner";
import { StateButton } from "@/components/utils/base/state-button";

const EditRow = ({r, message}: {r: any, message: string}) => {
    const {addError} = useErrors()
    const [status, setStatus] = useState<"done" | "no changes" | "pending">("pending")

    return <div className={"flex space-x-4"}>
        <div className={"flex space-x-3"}>
            <div>
                {r.id}
            </div>
            {r.props.map(p => {
                const prop = p as ArCabildoabiertoWikiTopicVersion.TopicProp
                return <TopicPropView
                    p={prop}
                    key={p.name}
                    className={""}
                    showAll={true}
                />
            })}
            {r.propsToDelete && <div>
                Se borran: {r.propsToDelete}
            </div>}
        </div>
        <div>
            {status == "done" && <div className={"bg-green-400 py-1 px-3 text-[var(--background)]"}>
                Aplicado
            </div>}
            {status == "no changes" && <div className={"bg-yellow-400 py-1 px-3 text-[var(--background)]"}>
                Sin cambios
            </div>}
            {status == "pending" && <StateButton
                variant={"outlined"}
                handleClick={async () => {
                    const edit: EditPropsParams = {
                        topic: {
                            id: r.id,
                            props: r.props,
                            propsToDelete: r.propsToDelete ?? []
                        },
                        message
                    }
                    const {error, data} = await post("/edit-topic", edit)
                    if(error) {
                        addError(error)
                    }
                    if(data != null) {
                        if(data) {
                            toast("Se creó la versión!")
                            setStatus("done")
                        } else {
                            toast("No se necesitan cambios.")
                            setStatus("no changes")
                        }
                    }
                    return {}
                }}
            >
                Aplicar
            </StateButton>}
        </div>
    </div>
}


export default function Page() {
    const [data, setData] = useState<any>(null)
    const [message, setMessage] = useState<string>("")


    const onUpload = async (files: FileList) => {
        setData(JSON.parse(await files[0].text()))
    }

    return <div className={""}>
        <div className={"p-4 border m-4 space-y-3"}>
            <UploadFileButton onUpload={onUpload}>
                Subir archivo
            </UploadFileButton>
            <div className={"flex w-64"}>
                <BaseTextField
                    label={"Mensaje"}
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value)
                    }}
                />
            </div>
            <StateButton
                variant={"outlined"}
                handleClick={async () => {
                    const batch: BatchEdit = {
                        message,
                        topics: data.map(d => ({
                            ...d,
                            propsToDelete: d.propsToDelete ?? []
                        }))
                    }
                    const {error} = await post("/batch-edit", batch)
                    return {error}
                }}
            >
                Aplicar todo
            </StateButton>
        </div>
        {data && <div className={"flex flex-col space-y-4 px-4 pb-32"}>{data.map((r, i) => {
            return <EditRow r={r} key={i} message={message}/>
        })}</div>}
    </div>
}
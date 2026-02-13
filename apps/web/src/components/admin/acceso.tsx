"use client"
import {StateButton} from "@/components/utils/base/state-button"
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import {ListEditor} from "@/components/utils/base/list-editor";
import {formatIsoDate} from "@cabildo-abierto/utils";
import {DateSince} from "@/components/utils/base/date";
import {listOrder, sortByKey} from "@cabildo-abierto/utils";
import {useAccessRequests} from "@/queries/getters/admin";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {post} from "@/components/utils/react/fetch";
import {categoriesSearchParam} from "@/components/utils/react/queries";


export const collectionsList = [
    "app.bsky.feed.post",
    "app.bsky.feed.like",
    "app.bsky.feed.repost",
    "app.bsky.graph.follow",
    "ar.com.cabildoabierto.article",
    "ar.com.cabildoabierto.topic",
    "app.bsky.actor.profile",
    "ar.com.cabildoabierto.quotePost",
    "ar.com.cabildoabierto.dataset",
    "ar.com.cabildoabierto.dataBlock",
    "ar.com.cabildoabierto.visualization",
    "ar.com.cabildoabierto.profile",
    "ar.cabildoabierto.wiki.topicVersion",
    "ar.cabildoabierto.feed.article",
    "ar.cabildoabierto.data.dataset"
]


async function copyCode(c: string) {
    const url = `https://www.cabildoabierto.ar/login?c=${c}`

    if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
    } else {
        console.warn("Clipboard API not available")
    }
}


function useCreateCodes() {
    return async (count: number) => {
        return await post<{}, { inviteCodes: string[] }>(`/invite-code/create?c=${count}`)
    }
}


const GenerateCode = () => {
    const [code, setCode] = useState<string | null>(null)

    const createCodes = useCreateCodes()

    async function onGenerateCode() {
        const res = await createCodes(1)
        if (res.success === false) {
            return {error: res.error}
        } else {
            setCode(res.value.inviteCodes[0])
            return {}
        }
    }

    return <div>
        {code && <div
            className={"font-mono text-sm cursor-pointer"}
            onClick={() => {
                copyCode(code)
            }}
        >
            {code}
        </div>}
        {!code && <StateButton
            handleClick={onGenerateCode}
            size={"small"}
        >
            Generar código
        </StateButton>}
    </div>
}

export const AdminAcceso = () => {
    const [handle, setHandle] = useState<string>("")
    const [codesAmount, setCodesAmount] = useState<number>(0)
    const [codes, setCodes] = useState([])
    const [collections, setCollections] = useState<string[]>([])
    const {data: accessRequests, refetch} = useAccessRequests()
    const createCodes = useCreateCodes()

    const deleteUser = async (handle: string) => {
        return post(`/user/delete/${handle}`)
    }

    const syncUser = async (handle: string, collections: string[]) => {
        return await post(`/sync-user/${handle}` + (collections && collections.length > 0 ? ` ${categoriesSearchParam(collections)}` : ""))
    }


    return <div className={"mt-12 flex flex-col items-center w-screen space-y-4 mb-64"}>
        <div>
            <ListEditor
                newItemText={"collection"}
                items={collections}
                setItems={setCollections}
                options={collectionsList}
            />
        </div>
        <div className={"flex items-center space-x-2"}>

            <div className={"w-64"}>
                <BaseTextField
                    placeholder={"usuario"}
                    value={handle}
                    onChange={(e) => {
                        setHandle(e.target.value)
                    }}
                />
            </div>

            <div className={"flex items-center space-x-2 w-full"}>
                <StateButton
                    size={"small"}
                    handleClick={async () => {
                        const res = await deleteUser(handle)
                        return {error: res.success === false ? res.error : undefined}
                    }}
                >
                    Eliminar
                </StateButton>
                <StateButton
                    size={"small"}
                    handleClick={async () => {
                        await syncUser(handle, collections)
                        return {}
                    }}
                >
                    Sincronizar
                </StateButton>
            </div>
        </div>

        <div className={"flex items-center space-x-2"}>
            <div className={"w-48"}>
                <BaseTextField
                    type={"number"}
                    placeholder={"cantidad"}
                    value={codesAmount}
                    onChange={(e) => {
                        setCodesAmount(Number(e.target.value))
                    }}
                />
            </div>

            <div>
                <StateButton
                    size={"small"}
                    handleClick={async () => {
                        const res = await createCodes(codesAmount)
                        if(res.success === true) {
                            setCodes(res.value.inviteCodes)
                            return {}
                        } else {
                            return {error: res.error}
                        }
                    }}
                >
                    Generar códigos
                </StateButton>
            </div>
        </div>

        <AdminSection title={"Códigos de acceso"}>
            <div>
                {codes &&
                    <div className={"font-mono whitespace-pre-line"}>
                        {codes.map(c => `https://www.cabildoabierto.ar/login?c=${c}`).join("\n")}
                    </div>
                }
            </div>
        </AdminSection>

        <AdminSection title={"Solicitudes de acceso"}>
            {accessRequests && sortByKey(accessRequests, c => {
                return c.createdAt ? [new Date(c.createdAt).getTime()] : [0]
            }, listOrder).map((a, i) => {
                return <div
                    key={i}
                    className={"space-y-1 bg-[var(--background-dark)] rounded-lg p-2 flex flex-col items-start w-[360px]"}
                >
                    <div className={"font-bold"}>
                        {a.email}
                    </div>
                    {a.comment && <div className={"bg-[var(--background-dark3)] rounded p-1"}>
                        {a.comment}
                    </div>}
                    <div>
                        {a.sentInviteAt ? <div className={"bg-green-800 rounded text-sm px-1"}>
                            Enviada {formatIsoDate(a.sentInviteAt)}
                        </div> : a.markedIgnored ? <div className={"bg-yellow-700 rounded text-sm px-1"}>
                            Ignorada
                        </div> : <div className={"bg-[var(--background-dark3)] px-1 text-sm rounded"}>
                            Pendiente
                        </div>}
                    </div>
                    <div className={"text-sm"}>
                        Hace <DateSince date={a.createdAt}/>
                    </div>
                    <GenerateCode/>
                    {!a.sentInviteAt && !a.markedIgnored && <div className={"w-full flex justify-end gap-2"}>
                        <StateButton
                            size={"small"}
                            handleClick={async () => {
                                const res = await post<{}, {}>(`/access-request-ignored/${a.id}`)
                                refetch()
                                return {error: res.success === false ? res.error : undefined}
                            }}
                        >
                            Ignorar
                        </StateButton>
                        <StateButton
                            size={"small"}
                            handleClick={async () => {
                                const res = await post<{}, {}>(`/access-request-sent/${a.id}`)
                                refetch()
                                return {error: res.success === false ? res.error : undefined}
                            }}
                        >
                            Marcar como enviada
                        </StateButton>
                    </div>}
                </div>
            })}
        </AdminSection>
    </div>
}
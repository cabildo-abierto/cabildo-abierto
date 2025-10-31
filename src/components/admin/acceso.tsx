"use client"
import StateButton from "../layout/utils/state-button";
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import {ListEditor} from "../layout/utils/list-editor";
import {get, post} from "@/utils/fetch";
import {formatIsoDate} from "@/utils/dates";
import {DateSince} from "../layout/utils/date";
import {listOrder, sortByKey} from "@/utils/arrays";
import {useAccessRequests} from "@/queries/getters/admin";
import {categoriesSearchParam} from "@/queries/utils";
import {DatasetTableView, RawDatasetView} from "@/components/visualizations/datasets/dataset-table-view";
import {BaseTextField} from "@/components/layout/base/base-text-field";


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

const deleteUser = async (handle: string) => {
    return post(`/user/delete/${handle}`)
}

const syncUser = async (handle: string, collections: string[]) => {
    return await post(`/sync-user/${handle}?` + categoriesSearchParam(collections))
}

const createCodes = async (count: number) => {
    return await post<{}, { inviteCodes: string[] }>(`/invite-code/create?c=${count}`)
}

type UserAccessStatus = {
    did: string
    handle: string | null
    created_at: Date | null
    hasAccess: boolean
    inCA: boolean
    inviteCode: string | null
    mirrorStatus: string
    displayName: string | null
}

const getUsersAccessStatus = async () => {
    return await get<UserAccessStatus[]>("/users")
}


async function copyCode(c: string) {
    const url = `https://www.cabildoabierto.ar/login?c=${c}`

    if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
    } else {
        console.warn("Clipboard API not available")
    }
}


const GenerateCode = () => {
    const [code, setCode] = useState<string | null>(null)

    async function onGenerateCode() {
        const {data, error} = await createCodes(1)
        if (error) return {error}
        if (data) {
            setCode(data.inviteCodes[0])
        }
        return {}
    }

    return <div>
        {code && <div className={"font-mono text-sm cursor-pointer"} onClick={() => {
            copyCode(code)
        }}>
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


function usersAccessStatusToDataset(u: UserAccessStatus[]): RawDatasetView {
    return {
        data: JSON.stringify(u),
        columns: Array.from(Object.keys(u[0])).map(c => ({name: c}))
    }
}


export const AdminAcceso = () => {
    const [handle, setHandle] = useState<string>("")
    const [codesAmount, setCodesAmount] = useState<number>(0)
    const [codes, setCodes] = useState([])
    const [users, setUsers] = useState<UserAccessStatus[] | null>(null)
    const [collections, setCollections] = useState<string[]>([])
    const {data: accessRequests, refetch} = useAccessRequests()


    return <div className={"mt-12 flex flex-col items-center max-w-90 space-y-4 mb-64"}>
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
                        const {error} = await deleteUser(handle)
                        return {error}
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
                    Syncronizar
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
                        const {error, data} = await createCodes(codesAmount)
                        setCodes(data.inviteCodes)
                        return {error}
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

        <AdminSection title={"Usuarios de CA"}>
            <StateButton
                size={"small"}
                handleClick={async () => {
                    setUsers([])
                    const {data: users} = await getUsersAccessStatus()
                    setUsers(users)
                    return {}
                }}
            >
                Leer usuarios
            </StateButton>

            {users && users.length > 0 && (
                <DatasetTableView
                    maxWidth={800}
                    maxHeight={600}
                    dataset={usersAccessStatusToDataset(users)}
                />
            )}

        </AdminSection>

        <AdminSection title={"Solicitudes de acceso"}>
            {accessRequests && sortByKey(accessRequests, c => {
                return c.createdAt ? [new Date(c.createdAt).getTime()] : [0]
            }, listOrder).map((a, i) => {
                return <div key={i}
                            className={"space-y-1 bg-[var(--background-dark)] rounded-lg p-2 flex flex-col items-start"}>
                    <div className={"font-bold"}>
                        {a.email}
                    </div>
                    {a.comment && <div className={"bg-[var(--background-dark3)] rounded p-1"}>
                        {a.comment}
                    </div>}
                    <div>
                        {a.sentInviteAt ? <div className={"bg-green-800 rounded text-sm px-1"}>
                            Enviada {formatIsoDate(a.sentInviteAt)}
                        </div> : <div className={"bg-[var(--background-dark3)] px-1 text-sm rounded"}>
                            Pendiente
                        </div>}
                    </div>
                    <div className={"text-sm"}>
                        Hace <DateSince date={a.createdAt}/>
                    </div>
                    <GenerateCode/>
                    {!a.sentInviteAt && <div className={"w-full flex justify-end"}>
                        <StateButton
                            size={"small"}
                            handleClick={async () => {
                                const {error} = await post<{}, {}>(`/access-request-sent/${a.id}`)
                                refetch()
                                return {error}
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
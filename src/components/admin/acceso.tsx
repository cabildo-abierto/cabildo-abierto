"use client"
import {TextField} from "@mui/material";
import StateButton from "../../../modules/ui-utils/src/state-button";
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import {ListEditor} from "../../../modules/ui-utils/src/list-editor";
import {categoriesSearchParam, useAccessRequests} from "@/queries/api";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {get, post} from "@/utils/fetch";
import {WarningButton} from "../../../modules/ui-utils/src/warning-button";
import {formatIsoDate} from "@/utils/dates";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {listOrder, sortByKey} from "@/utils/arrays";


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
    "ar.cabildoabierto.feed.article"
]

const deleteUser = async (handle: string) => {
    return post(`/user/delete/${handle}`)
}

const syncUser = async (handle: string, collections: string[]) => {
    return await post(`/sync-user/${handle}?`+categoriesSearchParam(collections))
}

const createCodes = async (count: number) => {
    return await post<{}, {inviteCodes: string[]}>(`/invite-code/create?c=${count}`)
}

const getUsers = async () => {
    return await get<ProfileViewBasic[]>("/users")
}

export const AdminAcceso = () => {
    const [handle, setHandle] = useState<string>("")
    const [codesAmount, setCodesAmount] = useState<number>(0)
    const [codes, setCodes] = useState([])
    const [users, setUsers] = useState<ProfileViewBasic[] | null>(null)
    const [collections, setCollections] = useState<string[]>([])
    const {data: accessRequests, refetch} = useAccessRequests()


    async function copyCode(c: string) {
        const url = `https://www.cabildoabierto.ar/login?c=${c}`

        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url)
        } else {
            console.warn("Clipboard API not available")
        }
    }


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
                <TextField
                    size={"small"}
                    placeholder={"usuario"}
                    value={handle}
                    onChange={(e) => {
                        setHandle(e.target.value)
                    }}
                    fullWidth={true}
                />
            </div>

            <div className={"flex items-center space-x-2 w-full"}>
                <WarningButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Eliminar"}
                    handleClick={async () => {
                        const {error} = await deleteUser(handle)
                        return {error}
                    }}
                    warningText={"¿Estás seguro de que querés eliminar el usuario?"}
                />
                <StateButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Sincronizar"}
                    handleClick={async () => {
                        await syncUser(handle, collections)
                        return {}
                    }}
                />
            </div>
        </div>

        <div className={"flex items-center space-x-2"}>
            <div className={"w-48"}>
                <TextField
                    size={"small"}
                    type={"number"}
                    placeholder={"cantidad"}
                    value={codesAmount}
                    onChange={(e) => {
                        setCodesAmount(Number(e.target.value))
                    }}
                    fullWidth={true}
                />
            </div>

            <div>
                <StateButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Generar códigos"}
                    handleClick={async () => {
                        const {error, data} = await createCodes(codesAmount)
                        setCodes(data.inviteCodes)
                        return {error}
                    }}
                />
            </div>
        </div>

        <AdminSection title={"Códigos de acceso"}>
            {codes && <div className={"flex flex-col space-y-2 max-h-[400px] overflow-y-scroll px-4"}>
                {codes.map(c => {
                    return <button className="hover:bg-[var(--background-dark)] p-1 rounded" key={c} onClick={() => {
                        copyCode(c)
                    }}>
                        {c}
                    </button>
                })}
            </div>
            }
        </AdminSection>

        <AdminSection title={"Usuarios de CA"}>

            <StateButton
                size={"small"}
                fullWidth={true}
                text1={"Leer usuarios"}
                handleClick={async () => {
                    setUsers([])
                    const {data: users} = await getUsers()
                    setUsers(users)
                    return {}
                }}
            />

            {users && (
                <div className="flex flex-col space-y-1">
                    {users.map((u, index) => (
                        <div key={index} className={"border rounded p-2"}>
                            <div>@{u.handle ? u.handle : "sin handle"}</div>
                            <div>{u.displayName ? u.displayName : "sin display name"}</div>
                        </div>
                    ))}
                </div>
            )}

        </AdminSection>

        <AdminSection title={"Solicitudes de acceso"}>
            {accessRequests && sortByKey(accessRequests, c => {return c.createdAt ? [new Date(c.createdAt).getTime()] : [0]}, listOrder).map((a, i) => {
                return <div key={i} className={"space-y-1 bg-[var(--background-dark)] rounded-lg p-2 flex flex-col items-start"}>
                    <div className={"font-bold"}>
                        {a.email}
                    </div>
                    {a.comment && <div className={"bg-[var(--background-dark4)] rounded p-1"}>
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
                    {!a.sentInviteAt && <div className={"w-full flex justify-end"}>
                        <StateButton
                            text1={"Marcar como enviada"}
                            size={"small"}
                            handleClick={async () => {
                                const {error} = await post<{}, {}>(`/access-request-sent/${a.id}`)
                                refetch()
                                return {error}
                            }}
                        />
                    </div>}
                </div>
            })}
        </AdminSection>
    </div>
}
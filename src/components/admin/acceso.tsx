"use client"
import {TextField} from "@mui/material";
import StateButton from "../ui-utils/state-button";
import {createCodes, grantAccess} from "../../actions/user/access";
import React, {useState} from "react";
import {useCodes} from "../../hooks/user";
import {AdminSection} from "./admin-section";
import {deleteUser} from "../../actions/admin";
import {getUsers} from "../../actions/user/users";
import {SmallUserProps} from "../../app/lib/definitions";
import {syncUser} from "../../actions/sync/sync-user";
import {ListEditor} from "../ui-utils/list-editor";
import {collectionsList} from "../../actions/sync/utils";


export const AdminAcceso = () => {
    const [handle, setHandle] = useState<string>("")
    const [codesAmount, setCodesAmount] = useState<number>(0)
    const {codes} = useCodes()
    const [users, setUsers] = useState<SmallUserProps[] | null>(null)
    const [collections, setCollections] = useState<string[]>([])

    async function copyCode(c: string) {
        const url = `https://www.cabildoabierto.com.ar/login?c=${c}`

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
                <StateButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Dar acceso"}
                    handleClick={async () => {
                        await grantAccess(handle)
                        return {}
                    }}
                />
                <StateButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Eliminar"}
                    handleClick={async () => {
                        await deleteUser(handle)
                        return {}
                    }}
                />
                <StateButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Sincronizar"}
                    handleClick={async () => {
                        await syncUser(handle, collections, 1)
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
                        await createCodes(codesAmount)
                        return {}
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
                    const {users} = await getUsers()
                    setUsers(users)
                    return {}
                }}
            />

            {users && (
                <div className="grid grid-cols-2 gap-4">
                    {users.map((u, index) => (
                        <React.Fragment key={index}>
                            <div>{u.did}</div>
                            <div>{u.handle ? u.handle : "sin handle"}</div>
                        </React.Fragment>
                    ))}
                </div>
            )}

        </AdminSection>
    </div>
}
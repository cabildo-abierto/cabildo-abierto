import {AdminSection} from "@/components/admin/admin-section";
import StateButton from "../layout/utils/state-button";
import {get, post} from "@/utils/fetch";
import React, {useState} from "react";
import { BaseTextField } from "../layout/base/base-text-field";

type UserRepoCounts = {
    counts: {
        collection: string
        count: number
    }[]
}

export const AdminPDS = () => {
    const [password, setPassword] = useState("")
    const [handle, setHandle] = useState("")
    const [inviteCode, setInviteCode] = useState("")
    const [email, setEmail] = useState("")

    const [handleOrDid, setHandleOrDid] = useState("")
    const [collection, setCollection] = useState("")
    const [counts, setCounts] = useState<UserRepoCounts>(undefined)

    async function readRepo() {
        const {data, error} = await get<UserRepoCounts>(`/repo/${handleOrDid}`)
        if (error) return {error}
        setCounts(data)
        return {}
    }

    return <div className={"space-y-8"}>
        <AdminSection title={"Crear cuenta"}>
            <div className={"flex flex-col items-center space-y-4"}>
                <BaseTextField
                    value={handle}
                    onChange={(e) => {
                        setHandle(e.target.value)
                    }}
                    label={"Handle"}
                />
                <BaseTextField
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    label={"Contraseña"}
                />
                <BaseTextField
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    label={"Mail"}
                />
                <BaseTextField
                    value={inviteCode}
                    onChange={(e) => {
                        setInviteCode(e.target.value)
                    }}
                    label={"Código de invitación"}
                />
                <div className={"space-y-4"}>
                    <StateButton
                        size={"small"}
                        handleClick={async () => {
                            await post("/migrate-to-ca-pds", {password, inviteCode})
                            return {}
                        }}
                    >
                        Migrar a CA
                    </StateButton>
                    <StateButton
                        size={"small"}
                        handleClick={async () => {
                            await post("/signup-cabildo", {handle, password, inviteCode})
                            return {}
                        }}
                    >
                        Crear cuenta
                    </StateButton>
                </div>
            </div>
        </AdminSection>
        <AdminSection title={"Explorar PDS"}>
            <div className={"flex flex-col items-center space-y-2"}>
                <BaseTextField
                    label={"Usuario"}
                    value={handleOrDid}
                    onChange={(e) => {
                        setHandleOrDid(e.target.value)
                    }}
                />
                <StateButton handleClick={readRepo}>
                    Leer repo
                </StateButton>
                {counts && <div>{counts.counts.map(c => {
                    return <div key={c.collection}>
                        {c.collection} {c.count}
                    </div>
                })}
                </div>}
                <BaseTextField
                    label={"Colección"}
                    value={collection}
                    onChange={(e) => {
                        setCollection(e.target.value)
                    }}
                />
            </div>
        </AdminSection>
    </div>
}
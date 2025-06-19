import {AdminSection} from "@/components/admin/admin-section";
import {TextField} from "@mui/material";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {get, post} from "@/utils/fetch";
import React, {useState} from "react";
import {Button} from "../../../modules/ui-utils/src/button";

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
    }

    return <div className={"space-y-8"}>
        <AdminSection title={"Crear cuenta"}>
            <div className={"flex flex-col items-center space-y-4"}>
                <TextField
                    value={handle}
                    onChange={(e) => {
                        setHandle(e.target.value)
                    }}
                    size={"small"}
                    label={"Handle"}
                />
                <TextField
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    size={"small"}
                    label={"Contraseña"}
                />
                <TextField
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    size={"small"}
                    label={"Mail"}
                />
                <TextField
                    value={inviteCode}
                    onChange={(e) => {
                        setInviteCode(e.target.value)
                    }}
                    size={"small"}
                    label={"Código de invitación"}
                />
                <div className={"space-y-4"}>
                    <StateButton
                        size={"small"}
                        fullWidth={true}
                        text1={"Migrar a CA"}
                        handleClick={async () => {
                            await post("/migrate-to-ca-pds", {password, inviteCode})
                            return {}
                        }}
                    />
                    <StateButton
                        size={"small"}
                        fullWidth={true}
                        text1={"Crear cuenta"}
                        handleClick={async () => {
                            await post("/signup-cabildo", {handle, password, inviteCode})
                            return {}
                        }}
                    />
                </div>
            </div>
        </AdminSection>
        <AdminSection title={"Explorar PDS"}>
            <div className={"flex flex-col items-center space-y-2"}>
                <TextField
                    label={"Usuario"}
                    size={"small"}
                    value={handleOrDid}
                    onChange={(e) => {
                        setHandleOrDid(e.target.value)
                    }}
                />
                <StateButton onClick={readRepo} text1={"Leer repo"}/>
                {counts && <div>{counts.counts.map(c => {
                    return <div key={c.collection}>
                        {c.collection} {c.count}
                    </div>
                })}
                </div>}
                <TextField
                    label={"Colección"}
                    size={"small"}
                    value={collection}
                    onChange={(e) => {
                        setCollection(e.target.value)
                    }}
                />
            </div>
        </AdminSection>
    </div>
}
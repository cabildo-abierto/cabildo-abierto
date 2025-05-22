import {AdminSection} from "@/components/admin/admin-section";
import {TextField} from "@mui/material";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {post} from "@/utils/fetch";
import React, {useState} from "react";


export const AdminPDS = () => {
    const [password, setPassword] = useState("")
    const [handle, setHandle] = useState("")
    const [inviteCode, setInviteCode] = useState("")
    const [email, setEmail] = useState("")
    return <div>
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
    </div>
}
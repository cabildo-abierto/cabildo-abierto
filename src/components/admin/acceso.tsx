"use client"
import {TextField} from "@mui/material";
import StateButton from "../ui-utils/state-button";
import {createCodes, grantAccess} from "../../actions/user/access";
import React, {useState} from "react";
import {useCodes} from "../../hooks/user";
import {AdminSection} from "./admin-section";


export const AdminAcceso = () => {
    const [accessHandle, setAccessHandle] = useState<string>("")
    const [codesAmount, setCodesAmount] = useState<number>(0)
    const {codes} = useCodes()

    async function copyCode(c: string) {
        const url = `https://www.cabildoabierto.com.ar/login?c=${c}`

        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url)
        } else {
            console.warn("Clipboard API not available")
        }
    }


    return <div className={"mt-12 flex flex-col items-center max-w-90 space-y-4"}>
        <div className={"flex items-center space-x-2"}>
            <div className={"w-48"}>
                <TextField
                    size={"small"}
                    placeholder={"usuario"}
                    value={accessHandle}
                    onChange={(e) => {
                        setAccessHandle(e.target.value)
                    }}
                    fullWidth={true}
                />
            </div>

            <div>
                <StateButton
                    size={"small"}
                    fullWidth={true}
                    text1={"Dar acceso"}
                    handleClick={async () => {
                        await grantAccess(accessHandle)
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
                    return <button className="hover:bg-[var(--background-dark)] p-1 rounded"  key={c} onClick={() => {copyCode(c)}}>
                        {c}
                    </button>
                })}
            </div>
            }
        </AdminSection>
    </div>
}
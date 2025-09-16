"use client"
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "../../../modules/ui-utils/src/button";
import {isMobile} from "react-device-detect";


export const GoToLoginButton = ({fontSize = 13, className = "font-bold", text = "Crear una cuenta o iniciar sesión"}: {
    className?: string, fontSize?: number, text?: string
}) => {
    const router = useRouter()
    const params = useSearchParams()
    const inviteCode = params.get("c")

    return <Button
        color={"transparent"}
        variant={"outlined"}
        size={!isMobile ? "large" : "medium"}
        textTransform={""}
        sx={{
            borderRadius: 0,
            borderColor: "var(--text)"
        }}

        onClick={() => {
            router.push("/login" + (inviteCode ? `?c=${inviteCode}` : ""))
        }}
    >
        <span className={className} style={{fontSize}}>{text}</span>
    </Button>
}


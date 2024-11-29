"use client"
import { useRouter } from "next/navigation"
import { logout } from "../actions/auth"
import StateButton from "./state-button"



export const CloseSessionButton = () => {
    const router = useRouter()

    const onLogout = async () => {
        await logout()
        router.push("/")
        return {}
    }

    return <div className="flex justify-center">
        <StateButton
            variant="text"
            size="small"
            color="primary"
            handleClick={onLogout}
            text1="CERRAR SESIÓN"
        />
    </div>
}
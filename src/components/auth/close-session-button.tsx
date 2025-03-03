"use client"
import { useRouter } from "next/navigation"
import { logout } from "../../actions/auth"
import StateButton from "../ui-utils/state-button"


export const CloseSessionButton = () => {
    const router = useRouter()

    const onLogout = async () => {
        await logout()
        router.push("/")
        return {}
    }

    return <StateButton
        variant="text"
        size="medium"
        color="error"
        handleClick={onLogout}
        text1="Cerrar sesión"
    />
}
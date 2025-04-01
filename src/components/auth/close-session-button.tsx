"use client"
import { logout } from "@/server-actions/auth"
import StateButton from "../../../modules/ui-utils/src/state-button"
import {useSWRConfig} from "swr";
import {useRouter} from "next/navigation";


export const CloseSessionButton = () => {
    const {mutate} = useSWRConfig()
    const router = useRouter()

    const onLogout = async () => {
        await logout()
        await mutate("/api/user", {loggedOut: true})
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
"use client"
import StateButton from "../../../modules/ui-utils/src/state-button"
import {useSWRConfig} from "swr";
import {useRouter} from "next/navigation";


export const logout = async () => {
    // TO DO
}


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
        variant="contained"
        size="small"
        color="error"
        handleClick={onLogout}
        text1="Cerrar sesión"
    />
}
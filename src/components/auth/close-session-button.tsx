"use client"
import StateButton from "../../../modules/ui-utils/src/state-button"
import {useSWRConfig} from "swr";
import {useRouter} from "next/navigation";
import {backendUrl} from "@/utils/uri";
import {post} from "@/utils/fetch";


export const logout = async () => {
    console.log("logging out")
    const {error} = await post("/logout")
    if(error){
        console.error("Error on logout", error)
    } else {
        console.log("logout ok")
    }
}


export const CloseSessionButton = () => {
    const {mutate} = useSWRConfig()
    const router = useRouter()

    const onLogout = async () => {
        await logout()
        await mutate(backendUrl + "/session", {loggedOut: true})
        await mutate(backendUrl + "/account")
        router.push("/presentacion")
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
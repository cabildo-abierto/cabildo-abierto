"use client"
import StateButton from "../../../modules/ui-utils/src/state-button"
import {useRouter} from "next/navigation";
import {post} from "@/utils/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query"


export const logout = async () => {
    const {error} = await post("/logout")
    if(error){
        console.error("Error on logout", error)
    }
}



export const CloseSessionButton = () => {
    const queryClient = useQueryClient()
    const router = useRouter()

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            queryClient.clear()
            router.push("/")
        }
    })

    const onLogout = async () => {
        await logoutMutation.mutateAsync()
        return {}
    }

    return (
        <StateButton
            variant="contained"
            size="medium"
            color="red-dark"
            textClassName={"text-[var(--button-text)]"}
            handleClick={onLogout}
            text1="Cerrar sesión"
        />
    )
}

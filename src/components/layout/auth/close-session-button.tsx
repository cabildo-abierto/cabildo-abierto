"use client"
import StateButton from "../utils/state-button"
import {useRouter} from "next/navigation";
import {post} from "@/utils/fetch";
import {QueryClient, useQueryClient} from "@tanstack/react-query"
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";


export const logout = async (qc: QueryClient, router: AppRouterInstance) => {
    const {error} = await post("/logout")
    if(error) return {error}
    qc.clear()
    router.push("/")
    return {}
}



export const CloseSessionButton = () => {
    const qc = useQueryClient()
    const router = useRouter()

    const onLogout = async () => {
        return await logout(qc, router)
    }

    return (
        <StateButton
            variant="contained"
            size="medium"
            color="red-dark"
            textClassName={"text-[var(--white-text)]"}
            handleClick={onLogout}
            text1="Cerrar sesión"
        />
    )
}

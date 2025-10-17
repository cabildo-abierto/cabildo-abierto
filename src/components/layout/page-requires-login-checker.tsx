"use client"
import {ReactNode} from "react";
import {useSession} from "@/queries/getters/useSession";
import {usePathname} from "next/navigation";
import { Button } from "./utils/button";
import {useLoginModal} from "@/components/layout/login-modal-provider";


export const LoginRequiredPage = ({text}: {text?: string}) => {
    const {setLoginModalOpen} = useLoginModal()
    return <div className={"flex flex-col items-center pt-32 space-y-12"}>
        {text && <div className={"font-light text-[var(--text-light)] px-6"}>
            {text}
        </div>}
        <Button variant={"outlined"} onClick={() => {setLoginModalOpen(true)}}>
            <span className={"text-xs p-1"}>
                Crear una cuenta o iniciar sesión
            </span>
        </Button>
    </div>
}


export const PageRequiresLoginChecker = ({children}: {children: ReactNode}) => {
    const {user} = useSession()
    const pathname = usePathname()

    if (["/notificaciones", "/mensajes", "/ajustes", "/papeles"].includes(pathname) && !user){
        return <LoginRequiredPage/>
    }

    return children
}
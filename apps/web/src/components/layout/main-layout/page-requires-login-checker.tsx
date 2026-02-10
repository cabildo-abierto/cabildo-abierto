"use client"
import {ReactNode} from "react";
import {useSession} from "@/components/auth/use-session";
import {usePathname} from "next/navigation";
import {BaseButton} from "@/components/utils/base/base-button";
import {useLoginModal} from "../../auth/login-modal-provider";
import {Note} from "@/components/utils/base/note";


export const LoginRequiredPage = ({text}: {text?: string}) => {
    const {setLoginModalOpen} = useLoginModal()
    return <div className={"flex flex-col items-center pt-32 space-y-12"}>
        {text && <Note>
            {text}
        </Note>}
        <BaseButton
            size={"small"}
            variant={"outlined"}
            onClick={() => {setLoginModalOpen(true)}}
        >
            Crear una cuenta o iniciar sesión
        </BaseButton>
    </div>
}


export const PageRequiresLoginChecker = ({children}: {children: ReactNode}) => {
    const {user} = useSession()
    const pathname = usePathname()

    if (["/notificaciones", "/mensajes", "/ajustes", "/papeles", "/ajustes"].some(x => pathname.startsWith(x)) && !user){
        return <LoginRequiredPage/>
    }

    return children
}
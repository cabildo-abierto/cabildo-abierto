"use client"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ReactNode} from "react";
import {CloseButton} from "@/components/utils/base/close-button";
import {useLogout} from "@/components/auth/logout";
import {useLoginModal} from "@/components/auth/login-modal-provider";
import {useSession} from "@/components/auth/use-session";

const SessionMark = () => {
    const {user, isLoading} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    const {logout} = useLogout()

    if(isLoading) {
        return <div>
            <LoadingSpinner/>
        </div>
    } else if(user) {
        return <div className={"flex space-x-2 items-center tracking-tighter"}>
            <div>
                @{user.handle}
            </div>
            <CloseButton onClose={logout} size={"small"}/>
        </div>
    } else {
        return <button onClick={() => setLoginModalOpen(true)}>
            Iniciar sesión
        </button>
    }
}

export default function Layout({children}: {children: ReactNode}) {
    return <div>
        <div className={"fixed top-2 right-2"}>
            <SessionMark/>
        </div>
        {children}
    </div>
}
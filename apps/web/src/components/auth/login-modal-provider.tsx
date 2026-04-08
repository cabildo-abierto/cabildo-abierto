import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {usePathname} from "next/navigation";
import {createPortal} from "react-dom";
import dynamic from "next/dynamic";
import {ConfirmModal} from "@/components/utils/dialogs/confirm-modal";
import {LoginModalPage} from "@/components/auth/login-modal";


const LoginModal = dynamic(() => import("./login-modal").then(mod => mod.LoginModal), {ssr: false})

const LoginModalContext = createContext<{
    loginModalOpen: boolean
    allowsClose: boolean
    setLoginModalOpen: (v: boolean, w?: boolean, msg?: string, trial?: boolean) => void
    createdAccount: string | null
    setCreatedAccount: (v: string | null) => void
    page: LoginModalPage
    setPage: (v: LoginModalPage) => void
} | undefined>(undefined)


export const useLoginModal = () => {
    const context = useContext(LoginModalContext);
    if (!context) {
        throw new Error("useTopbarState must be used within a TopbarContext");
    }
    return context;
};


export const LoginModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [page, setPage] = useState<LoginModalPage>("login")
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [allowsClose, setAllowsClose] = useState(false)
    const [showingMsg, setShowingMsg] = useState<string | null>(null)
    const pathname = usePathname()
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
    const [createdAccount, setCreatedAccount] = useState<string | null>(null)

    useEffect(() => {
        setPortalRoot(document.body)
    }, [])

    useEffect(() => {
        if(loginModalOpen){
            setLoginModalOpen(false)
        }
    }, [pathname])

    useEffect(() => {
        if(!loginModalOpen) {
            if(page != "login") {
                setPage("login")
            }
        }
    }, [loginModalOpen]);

    function onSetLoginModalOpen(open: boolean, w: boolean = true, msg?: string, trial: boolean = false) {
        setAllowsClose(w)
        if(msg) {
            setShowingMsg(msg)
        } else {
            setLoginModalOpen(open)
        }
        if(trial) {
            setPage("access request")
        }
    }

    return (
        <LoginModalContext.Provider value={{
            createdAccount, setCreatedAccount, page, setPage, loginModalOpen, allowsClose, setLoginModalOpen: onSetLoginModalOpen }}>
            {children}
            {portalRoot && createPortal(<LoginModal
                open={loginModalOpen}
                onClose={allowsClose ? () => {setLoginModalOpen(false)} : undefined}
            />, portalRoot)}
            {showingMsg && createPortal(<ConfirmModal
                onClose={() => {setShowingMsg(null)}}
                onConfirm={() => {setLoginModalOpen(true); setShowingMsg(null)}}
                open={true}
                confirmButtonText={"Iniciar sesión"}
                title={"Iniciá sesión"}
                text={showingMsg}
            />, document.body)}
        </LoginModalContext.Provider>
    )
}

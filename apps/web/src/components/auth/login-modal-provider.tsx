import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {usePathname} from "next/navigation";
import {createPortal} from "react-dom";
import dynamic from "next/dynamic";


const LoginModal = dynamic(() => import("./login-modal").then(mod => mod.LoginModal), {ssr: false})

const LoginModalContext = createContext<{
    loginModalOpen: boolean
    allowsClose: boolean
    setLoginModalOpen: (v: boolean, w?: boolean) => void
} | undefined>(undefined)


export const useLoginModal = () => {
    const context = useContext(LoginModalContext);
    if (!context) {
        throw new Error("useTopbarState must be used within a TopbarContext");
    }
    return context;
};


export const LoginModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false)
    const [allowsClose, setAllowsClose] = useState<boolean>(false)
    const pathname = usePathname()
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    useEffect(() => {
        setPortalRoot(document.body)
    }, [])

    useEffect(() => {
        if(loginModalOpen){
            setLoginModalOpen(false)
        }
    }, [pathname])

    function onSetLoginModalOpen(v: boolean, w: boolean = true) {
        setLoginModalOpen(v)
        setAllowsClose(w)
    }

    return (
        <LoginModalContext.Provider value={{ loginModalOpen, allowsClose, setLoginModalOpen: onSetLoginModalOpen }}>
            {children}
            {portalRoot && createPortal(<LoginModal
                open={loginModalOpen}
                onClose={allowsClose ? () => {setLoginModalOpen(false)} : undefined}
            />, portalRoot)}
        </LoginModalContext.Provider>
    )
}

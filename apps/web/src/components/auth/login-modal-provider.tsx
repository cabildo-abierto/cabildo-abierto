import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {usePathname} from "next/navigation";
import {createPortal} from "react-dom";
import dynamic from "next/dynamic";


const LoginModal = dynamic(() => import("./login-modal").then(mod => mod.LoginModal), {ssr: false})

const LoginModalContext = createContext<{
    loginModalOpen: boolean;
    setLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
    const pathname = usePathname()

    useEffect(() => {
        if(loginModalOpen){
            setLoginModalOpen(false)
        }
    }, [pathname])

    return (
        <LoginModalContext.Provider value={{ loginModalOpen, setLoginModalOpen }}>
            {children}
            {loginModalOpen && createPortal(<LoginModal
                open={loginModalOpen}
                onClose={() => {setLoginModalOpen(false)}}
            />, document.body)}
        </LoginModalContext.Provider>
    )
}

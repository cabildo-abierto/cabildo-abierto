"use client"

import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import LoginModal from "@/components/layout/auth/login-modal";
import {usePathname} from "next/navigation";



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
        setLoginModalOpen(false)
    }, [pathname])

    return (
        <LoginModalContext.Provider value={{ loginModalOpen, setLoginModalOpen }}>
            {children}
            {loginModalOpen && <LoginModal
                open={loginModalOpen}
                onClose={() => {setLoginModalOpen(false)}}
            />}
        </LoginModalContext.Provider>
    )
}

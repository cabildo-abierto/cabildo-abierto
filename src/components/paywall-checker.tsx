"use client"

import { CustomLink as Link } from './custom-link';
import LoadingPage from "./loading-page"
import { ReactNode } from "react";
import { useUser } from "../app/hooks/user";


export const NeedAccountPaywall: React.FC<any> = ({ children }) => {
    return (
        <>
            <div className="relative z-0">
                {children}
            </div>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg mx-1">
                    <div className="py-4 text-lg">Creá una cuenta o iniciá sesión para acceder a esta sección</div>
                    <div className="flex justify-center items-center py-8 space-x-4">
                        <Link href="/" className="gray-btn">
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};


export const UserName = ({name}: {name: string}) => {
    return <span className="text-[var(--primary)]">{name}</span>
}


const PaywallChecker: React.FC<{children: ReactNode, requireAccount?: boolean}> = ({children, requireAccount=true}) => {
    const user = useUser()
    
    if(user.isLoading){
        return <LoadingPage>
            {children}
        </LoadingPage>
    } else if(!user.user && requireAccount){
        return <NeedAccountPaywall>
            {children}
        </NeedAccountPaywall>
    } else {
        return <>{children}</>
    }
}

export default PaywallChecker
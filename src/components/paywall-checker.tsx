"use client"

import Link from "next/link"
import LoadingPage from "./loading-page"
import { validSubscription } from "./utils"
import { ReactNode } from "react";
import { useUser } from "../app/hooks/user";


export const NeedAccountPaywall: React.FC<any> = ({ children }) => {
    return (
        <>
            <div className="relative z-0">
                {children}
            </div>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    <div className="py-4 text-lg">Iniciá sesión o creá una cuenta para ver esta página</div>
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


const NeedSubscriptionPaywall: React.FC<any> = ({ children }) => {
    return (
        <>
            <div className="relative z-0">
                {children}
            </div>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    <div className="py-4 text-lg">Necesitás una suscripción activa para ver esta página</div>
                    <div className="flex justify-center items-center py-8 space-x-4">
                        <Link href="/suscripciones" className="gray-btn">
                            Obtener una suscripción
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};



const PaywallChecker: React.FC<{children: ReactNode, requireSubscription?: boolean}> = ({children, requireSubscription=true}) => {
    const user = useUser()
    
    if(user.isLoading){
        return <LoadingPage>
            {children}
        </LoadingPage>
    } else if(!user.user){
        return <NeedAccountPaywall>
            {children}
        </NeedAccountPaywall>
    } else {
        if(!requireSubscription || validSubscription(user.user)){
            return <>{children}</>
        } else {
            return <NeedSubscriptionPaywall>
                {children}
            </NeedSubscriptionPaywall>
        }
    }
}

export default PaywallChecker
"use client"

import Link from "next/link"
import LoadingPage from "./loading-page"
import { useUser } from "./user-provider"
import { validSubscription } from "./utils"
import { useContents } from "./use-contents"
import { useUsers } from "./use-users"
import { useEntities } from "./use-entities"


const NeedAccountPaywall: React.FC<any> = ({ children }) => {
    return (
        <>
            <div className="relative z-0">
                {children}
            </div>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center">
                
                <div className="bg-white rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    <div className="py-4 text-lg">Iniciá sesión o creá una cuenta para ver esta página</div>
                    <div className="flex justify-between items-center py-8 space-x-4">
                        <Link href="/" className="large-btn scale-btn">
                            Iniciar sesión
                        </Link>
                        <Link href="/signup" className="large-btn scale-btn">
                            Crear cuenta
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
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center">
                
                <div className="bg-white rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    <div className="py-4 text-lg">Necesitás una suscripción activa para ver esta página</div>
                    <div className="flex justify-center items-center py-8 space-x-4">
                        <Link href="/suscripciones" className="large-btn">
                            Obtener una suscripción
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};



const PaywallChecker: React.FC<{children: any}> = ({children}) => {
    const {user, setUser} = useUser()

    if(user === null){
        return <NeedAccountPaywall>
            {children}
        </NeedAccountPaywall>
    } else if(user == undefined){
        return <LoadingPage/>
    } else {
        if(validSubscription(user)){
            return <>{children}</>
        } else {
            return <NeedSubscriptionPaywall>
                {children}
            </NeedSubscriptionPaywall>
        }
    }
}

export default PaywallChecker
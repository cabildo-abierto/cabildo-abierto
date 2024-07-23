"use client"
import Link from "next/link"
import { useUser } from "./user-provider"
import { validSubscription } from "./utils"

const SubscriptionRequiredPage = () => {
    return <>
        <div className="flex justify-center py-8">
            <h3>Necesitás una suscripción para ver esta página</h3>
            
        </div>
        <div className="flex justify-center">
        <Link href="/suscripciones">
            <button className="large-btn">
                Ver métodos de suscripción
            </button>
        </Link>
        </div>
    </>
}

const SubscriptionCheckWrapper: React.FC<any> = ({children}) => {
    const {user} = useUser()

    if(!validSubscription(user)){
        return <SubscriptionRequiredPage/>
    } else {
        return <>
            {children}
        </>
    }

    
}

export default SubscriptionCheckWrapper
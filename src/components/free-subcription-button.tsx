"use client"
import { getDonatedSubscription, getSubscriptionPoolSize } from "src/actions/subscriptions"
import StateButton from "./state-button"
import { useUser } from "src/app/hooks/user"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"


export const FreeSubscriptionButton = () => {
    const {user} = useUser()
    const router = useRouter()
    const {mutate} = useSWRConfig()
    const handlePayment = async () => {
        if(user){
            await getDonatedSubscription(user.id)
            await mutate("/api/user")
            router.push("/suscripciones")
        }
    }

    return <StateButton 
        onClick={handlePayment}
        className="gray-btn"
        text1="Usar una suscripción pendiente"
        text2="Agarrando una suscripción..."
    />
        
}
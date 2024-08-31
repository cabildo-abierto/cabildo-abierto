"use client"
import { getDonatedSubscription, getSubscriptionPoolSize } from "src/actions/subscriptions"
import StateButton from "./state-button"
import { useUser } from "src/app/hooks/user"
import { useRouter } from "next/navigation"


export const FreeSubscriptionButton = () => {
    const {user} = useUser()
    const router = useRouter()
    const handlePayment = async () => {
        if(user){
            await getDonatedSubscription(user.id)
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
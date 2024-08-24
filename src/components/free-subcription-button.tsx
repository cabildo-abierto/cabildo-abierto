"use client"
import { getDonatedSubscription, getSubscriptionPoolSize } from "@/actions/subscriptions"
import StateButton from "./state-button"
import { useUser } from "@/app/hooks/user"


export const FreeSubscriptionButton = () => {
    const {user} = useUser()
    const handlePayment = async () => {
        if(user){
            await getDonatedSubscription(user.id)
        }
    }

    return <StateButton 
        onClick={handlePayment}
        className="gray-btn"
        text1="Usar una suscripción pendiente"
        text2="Agarrando una suscripción..."
    />
        
}
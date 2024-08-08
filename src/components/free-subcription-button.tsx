"use client"
import { getUser } from "@/actions/get-user"
import { getDonatedSubscription, getSubscriptionPoolSize } from "@/actions/subscriptions"
import PayButton from "./pay-button"
import StateButton from "./state-button"


export const FreeSubscriptionButton = () => {
    const handlePayment = async () => {
        const user = await getUser()
        if(user){
            await getDonatedSubscription(user.id)
        }
    }

    return <StateButton 
        onClick={handlePayment}
        className="large-btn scale-btn"
        text1="Usar una suscripción pendiente"
        text2="Agarrando una suscripción..."
    />
        
}
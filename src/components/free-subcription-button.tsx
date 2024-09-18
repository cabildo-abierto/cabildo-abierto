"use client"
import StateButton from "./state-button"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { getDonatedSubscription } from "../actions/users"
import { useUser } from "../app/hooks/user"


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
        text2="Adquiriendo suscripción..."
    />
        
}
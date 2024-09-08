"use client"
import StateButton from "./state-button"
import { useUser } from "src/app/hooks/user"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { getDonatedSubscription } from "src/actions/actions"


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
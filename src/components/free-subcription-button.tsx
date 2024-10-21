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
        const {error} = await getDonatedSubscription(user.id)
        if(error) return {error}
        await mutate("/api/user")
        router.push("/inicio")
        return {}
    }

    return <StateButton 
        handleClick={handlePayment}
        className="gray-btn"
        text1="Usar una suscripción pendiente"
        text2="Adquiriendo suscripción..."
    />
        
}
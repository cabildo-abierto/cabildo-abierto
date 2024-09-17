"use client"

import PayButton from "./pay-button";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { buyAndUseSubscription } from "../actions/users";
import { useUser } from "../app/hooks/user";



export const BuyClassicPlanButton = () => {
    const {user} = useUser()
    const router = useRouter()
    const {mutate} = useSWRConfig()
    
    const handlePayment = async () => {
        if(user){
            await buyAndUseSubscription(user.id)
            await mutate("/api/user")
            router.push("/suscripciones")
        }
    }

    return <div className="py-16">
        <PayButton
            onClick={handlePayment}
        />
    </div>
}
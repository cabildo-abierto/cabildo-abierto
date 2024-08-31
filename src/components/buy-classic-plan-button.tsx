"use client"

import { buyAndUseSubscription } from "src/actions/subscriptions";
import PayButton from "./pay-button";
import { useUser } from "src/app/hooks/user";
import { useRouter } from "next/navigation";

export const BuyClassicPlanButton = () => {
    const {user} = useUser()
    const router = useRouter()
    const handlePayment = async () => {
        if(user){
            await buyAndUseSubscription(user.id)
            router.push("/suscripciones")
        }
    }

    return <div className="py-16">
        <PayButton
            onClick={handlePayment}
        />
    </div>
}
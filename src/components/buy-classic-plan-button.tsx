"use client"

import { getUser } from "@/actions/get-user";
import { buyAndUseSubscription } from "@/actions/subscriptions";

export const BuyClassicPlanButton = () => {
    const handlePayment = async () => {
        const user = await getUser()
        if(user){
            await buyAndUseSubscription(user.id)
        }
    }

    return <button
        className="large-btn py-16"
        onClick={handlePayment}>
            Pagar
    </button>
}
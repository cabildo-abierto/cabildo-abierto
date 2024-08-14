"use client"

import { getUser } from "@/actions/get-user";
import { buyAndUseSubscription } from "@/actions/subscriptions";
import PayButton from "./pay-button";

export const BuyClassicPlanButton = () => {
    const handlePayment = async () => {
        const user = await getUser()
        if(user){
            await buyAndUseSubscription(user.id)
        }
    }

    return <div className="py-16">
        <PayButton
            onClick={handlePayment}
        />
    </div>
}
"use client"

import { buyAndUseSubscription } from "src/actions/subscriptions";
import PayButton from "./pay-button";
import { useUser } from "src/app/hooks/user";

export const BuyClassicPlanButton = () => {
    const {user} = useUser()
    const handlePayment = async () => {
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
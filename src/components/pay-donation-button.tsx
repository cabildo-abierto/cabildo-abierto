"use client"
import { buyAndUseSubscription, donateSubscriptions } from "@/actions/subscriptions";

import PayButton from "@/components/pay-button";
import { validSubscription } from "./utils";

export const PayDonationButton = ({user, amount}: any) => {
    const handlePayment = async () => {
        if(!validSubscription(user)) {
            await buyAndUseSubscription(user.id, false)
            await donateSubscriptions(amount, user.id)
        } else {
            await donateSubscriptions(amount, user.id)
        }
    }

    return <PayButton onClick={handlePayment}/>
}
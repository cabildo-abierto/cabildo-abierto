"use client"
import { buyAndUseSubscription, donateSubscriptions } from "src/actions/subscriptions";

import PayButton from "src/components/pay-button";
import { validSubscription } from "./utils";
import { useUser } from "src/app/hooks/user";

export const PayDonationButton = ({amount}: {amount: number}) => {
    const {user, isLoading, isError} = useUser()

    const handlePayment = async () => {
        if(!user) return
        if(!validSubscription(user)) {
            await buyAndUseSubscription(user.id, false)
            await donateSubscriptions(amount, user.id)
        } else {
            await donateSubscriptions(amount, user.id)
        }
    }

    return <PayButton onClick={handlePayment}/>
}
"use client"
import { buyAndUseSubscription, donateSubscriptions } from "src/actions/subscriptions";

import PayButton from "src/components/pay-button";
import { useUser } from "src/app/hooks/user";
import { useRouter } from "next/navigation";

export const PayDonationButton = ({amount, oneForYou}: {amount: number, oneForYou: boolean}) => {
    const {user, isLoading, isError} = useUser()
    const router = useRouter()

    const handlePayment = async () => {
        if(!user) return
        await donateSubscriptions(amount, user.id)

        if(oneForYou)
            await buyAndUseSubscription(user.id, false)

        router.push("/suscripciones")
    }

    return <PayButton onClick={handlePayment}/>
}
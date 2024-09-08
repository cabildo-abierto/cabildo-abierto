"use client"

import PayButton from "src/components/pay-button";
import { useUser } from "src/app/hooks/user";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { buyAndUseSubscription, donateSubscriptions } from "src/actions/actions";

export const PayDonationButton = ({amount, oneForYou}: {amount: number, oneForYou: boolean}) => {
    const {user, isLoading, isError} = useUser()
    const router = useRouter()
    const {mutate} = useSWRConfig()

    const handlePayment = async () => {
        if(!user) return
        await donateSubscriptions(amount, user.id)

        if(oneForYou){
            await buyAndUseSubscription(user.id)
            await mutate("/api/user")
        }
        router.push("/suscripciones")
    }

    return <PayButton onClick={handlePayment}/>
}
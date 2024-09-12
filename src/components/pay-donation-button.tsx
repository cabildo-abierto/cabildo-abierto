"use client"

import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { useUser } from "../app/hooks/user";
import { donateSubscriptions, buyAndUseSubscription } from "../actions/users";
import PayButton from "./pay-button";

export const PayDonationButton = ({amount, oneForYou}: {amount: number, oneForYou: boolean}) => {
    const {user} = useUser()
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
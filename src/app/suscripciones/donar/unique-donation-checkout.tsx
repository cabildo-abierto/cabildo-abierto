import { useSubscriptionPrice } from "../../hooks/subscriptions"
import React, { useState } from 'react';
import { ThreeColumnsLayout } from '../../../components/three-columns';
import { validSubscription } from '../../../components/utils';
import { useUser } from '../../hooks/user';
import { MPWallet } from "../../../components/mp-wallet";



export function UniqueDonationCheckout({amount, preferenceId}: {amount: number, preferenceId: string}) {
    const {user} = useUser()
    const activeSubscription = validSubscription(user)
    const price = useSubscriptionPrice()
    
    const donations = activeSubscription ? amount : amount-1

    const center = <>
        {!activeSubscription ? <div className="flex justify-center mt-16">Vas a comprar una suscripción para vos y donar 
            {donations == 2 ? " una suscripción" : " " + (donations).toString() + " suscripciones"}</div>
         : <div className="flex justify-center mt-16">Estás por donar
            {donations == 1 ? " una suscripción" : " " + (donations).toString() + " suscripciones"}.</div>
        }
        {price.price && <div className="flex justify-center mt-8">{"Total: $"+price.price.price*amount}</div>}
        
        <div className="flex mt-8 flex-col items-center">
            <div className="px-2 mb-16">
                <MPWallet preferenceId={preferenceId}/>
            </div>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>
}
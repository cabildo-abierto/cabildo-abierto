
"use client"

import { useState } from "react"
import { useUser } from "../app/hooks/user"
import { validSubscription } from "./utils"
import DonationInput from "./donation-input"
import SubscriptionOptionButton from "./subscription-option-button"


export const NewDonation: React.FC = () => {
    const {user} = useUser()
    const [donationAmount, setDonationAmount] = useState(0)
    const activeSubscription = validSubscription(user)

    const minAmount = activeSubscription ? 1 : 2
    const validAmount = donationAmount >= minAmount && donationAmount <= 100

    return <>
        <div className="mt-16 flex justify-center">
            <DonationInput onChange={setDonationAmount} oneForYou={!activeSubscription}/>
        </div>
        {donationAmount > 100 && <div className="flex justify-center text-red-600 py-2">
            Si querés donar más de 100 suscripciones contactate con nosotros.
        </div>}

        <div className="mt-32 flex justify-center text-gray-600">
            Pagá con Mercado Pago o tarjeta de débito y crédito de cualquier banco.
        </div>
        <div className="flex justify-center items-center mt-2">
            <div className="w-full">
            
            <div className="flex justify-center py-2">
            <SubscriptionOptionButton
                title="Pago único"
                description="Pagá un solo mes. Sin compromisos."
                disabled={!validAmount}
                href={"/suscripciones/donar/pago-unico/"+donationAmount.toString()}
            />
            </div>
        
            <div className="flex justify-center">
            <SubscriptionOptionButton
                title="Pago automático"
                description={"Próximamente."/*"Poné la tarjeta (o cualquier medio de pago) y olvidate."*/}
                disabled={true}
                href={"/suscripciones/donar/pago-automatico/"+donationAmount.toString()}
            />
            </div>
            </div>
        </div>
    </>
}
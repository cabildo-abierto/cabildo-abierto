
"use client"
import Link from "next/link"
import DonationInput from "@/components/donation-input"
import { useState } from "react"
import SubscriptionOptionButton from "@/components/subscription-option-button"
import { validSubscription } from "@/components/utils"

export const NewDonation: React.FC<any> = ({user}) => {
    const [donationAmount, setDonationAmount] = useState(0)
    const activeSubscription = validSubscription(user)

    const minAmount = activeSubscription ? 1 : 2
    const validAmount = donationAmount >= minAmount && donationAmount <= 100

    return <>
        <div className="mt-16">
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
            <SubscriptionOptionButton
                title="Pago único"
                description="Sin compromisos"
                disabled={!validAmount}
                href={validAmount ? ("/suscripciones/donar/pago-unico/"+donationAmount.toString()) : null}
            />
        
            <SubscriptionOptionButton
                title="Pago automático"
                description={"Próximamente"/*"Poné la tarjeta (o cualquier medio de pago) y olvidate."*/}
                disabled={true}
                href={validAmount ? ("/suscripciones/donar/pago-automatico/"+donationAmount.toString()) : null}
            />
            </div>
        </div>
    </>
}
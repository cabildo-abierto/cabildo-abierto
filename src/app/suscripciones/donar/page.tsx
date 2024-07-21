"use client"
import { ThreeColumnsLayout } from "@/components/main-layout"
import Link from "next/link"
import DonationInput from "@/components/donation-input"
import { useState } from "react"
import SubscriptionOptionButton from "@/components/subscription-option-button"


export default function DonationPage() {
    const [donationAmount, setDonationAmount] = useState(0)

    const validAmount = donationAmount >= 2 && donationAmount <= 100

    const center = <div className="mt-8">
        <div className="flex justify-center items-center">
            <h2>
                Hacé crecer Cabildo Abierto
            </h2>
        </div>

        <div className="mt-16">
            <DonationInput onChange={setDonationAmount}/>
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
                description="Poné la tarjeta (o cualquier medio de pago) y olvidate."
                disabled={!validAmount}
                href={validAmount ? ("/suscripciones/donar/pago-automatico/"+donationAmount.toString()) : null}
            />
            </div>
        </div>
        <div className="flex justify-end items-center mt-4">
            <div>
                <Link href="/suscripciones"><button className="large-btn">Volver</button></Link>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={600}/>

}
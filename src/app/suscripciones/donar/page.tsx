"use client"
import Link from "next/link"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { useUser } from "../../hooks/user"
import { validSubscription } from "../../../components/utils"
import { initMercadoPago } from '@mercadopago/sdk-react'
import { useState } from "react"
import DonationInput from "../../../components/donation-input"
import SubscriptionOptionButton from "../../../components/subscription-option-button"
import { createPreference } from "../../../actions/users"
import dynamic from 'next/dynamic'
import { useSubscriptionPrice } from "../../hooks/subscriptions"

const Wallet = dynamic(() => import('@mercadopago/sdk-react').then(mod => mod.Wallet), { ssr: false });
initMercadoPago('APP_USR-1ddae427-daf5-49b9-b3bb-e1d5b5245f30');


function DonacionUnica({amount, preferenceId}: {amount: number, preferenceId: string}) {
    const {user} = useUser()
    const activeSubscription = validSubscription(user)
    const price = useSubscriptionPrice()
    
    const donations = activeSubscription ? amount : amount-1

    const center = <>
        {!activeSubscription ? <div className="flex justify-center mt-16">Vas a comprar una suscripción para vos y donar 
            {donations == 2 ? " una suscripción" : " " + (donations).toString() + " suscripciones"}</div>
         : <div className="flex justify-center mt-16">Estás por donar
            {donations == 1 ? " una suscripción" : " " + (donations).toString() + " suscripciones"}</div>
        }
        {price.price && <div className="flex justify-center mt-8">{"Total: $"+price.price.price*amount}</div>}
        
        <div className="flex mt-8 flex-col items-center">
            <div className="px-2 mb-16">
                <Wallet
                    initialization={{ preferenceId: preferenceId }}
                />
            </div>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}


export default function DonationPage() {
    const [choice, setChoice] = useState("none")
    const [preferenceId, setPreferenceId] = useState<undefined | string>()
    const [donationAmount, setDonationAmount] = useState(0)
    const {user} = useUser()

    const activeSubscription = validSubscription(user)

    const minAmount = activeSubscription ? 1 : 2
    const validAmount = donationAmount >= minAmount && donationAmount <= 200

    if(choice == "unique"){
        return <div className="flex flex-col items-center">
        <DonacionUnica amount={donationAmount} preferenceId={preferenceId}/>
        <button className="gray-btn" onClick={() => {setChoice("none"); setDonationAmount(0)}}>Volver</button>
        </div>
    }

    async function onUniqueChosen(){
        setChoice("unique")
        const id = await createPreference(user.id, donationAmount)
        setPreferenceId(id)
    }

    const center = <div className="mt-8">
        <div className="flex justify-center items-center">
            <h3>
                Donar suscripciones
            </h3>
        </div>
        <div className="flex justify-center">
            <div className="w-72 lg:w-96">
                
                <div className="mt-16 flex justify-center">
                    <DonationInput onChange={setDonationAmount} oneForYou={!activeSubscription}/>
                </div>
                
                {donationAmount > 200 && <div className="flex justify-center text-red-600 py-2">
                    Si querés donar más de 200 suscripciones contactate con nosotros.
                </div>}

                <div className="mt-32 flex justify-center items-center">
                    <div className="w-full">
                    
                        <div className="flex justify-center py-2">
                            <SubscriptionOptionButton
                                title="Hacer una donación única"
                                description=""
                                disabled={!validAmount}
                                onClick={onUniqueChosen}
                            />
                        </div>
                    
                        <div className="flex justify-center">
                            <SubscriptionOptionButton
                                title="Donar lo mismo todos los meses"
                                description={"Próximamente."/*"Poné la tarjeta (o cualquier medio de pago) y olvidate."*/}
                                disabled={true}
                                href={"/suscripciones/donar/pago-automatico/"+donationAmount.toString()}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end items-center mt-4">
                    <div>
                        <Link href="/suscripciones">
                            <button className="gray-btn">Volver</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={600}/>

}
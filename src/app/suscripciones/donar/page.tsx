"use client"
import Link from "next/link"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { useUser } from "../../hooks/user"
import { validSubscription } from "../../../components/utils"
import { useState } from "react"
import DonationInput from "../../../components/donation-input"
import SubscriptionOptionButton from "../../../components/subscription-option-button"
import { createPreference } from "../../../actions/users"
import { UniqueDonationCheckout } from "./unique-donation-checkout"



export default function DonationPage() {
    const [choice, setChoice] = useState("none")
    const [preferenceId, setPreferenceId] = useState<undefined | string>()
    const [donationAmount, setDonationAmount] = useState(0)
    const {user} = useUser()

    const activeSubscription = validSubscription(user)

    const minAmount = activeSubscription ? 1 : 2
    const validAmount = donationAmount >= minAmount && donationAmount <= 200

    async function onUniqueChosen(){
        setChoice("unique")
        const id = activeSubscription ? await createPreference(user.id, 0, donationAmount) : await createPreference(user.id, 1, donationAmount-1)
        setPreferenceId(id)
    }

    const donationInput = <div className="mt-8">
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

    const uniqueChosen = <div className="flex flex-col items-center">
        <UniqueDonationCheckout amount={donationAmount} preferenceId={preferenceId}/>
        <button className="gray-btn" onClick={() => {setChoice("none"); setDonationAmount(0)}}>Volver</button>
    </div>

    const center = <>
        {choice == "unique" && uniqueChosen}
        {choice != "unique" && donationInput}
    </>

    return <ThreeColumnsLayout center={center}/>
}
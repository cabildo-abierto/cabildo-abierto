"use client"
import Link from "next/link"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { useUser } from "../../hooks/user"
import { validSubscription } from "../../../components/utils"
import { useState } from "react"
import SubscriptionOptionButton from "../../../components/subscription-option-button"
import { UniqueDonationCheckout } from "./unique-donation-checkout"
import { IntegerInputPlusMinus } from "../clasico/integer-input-plus-minus"
import { useSubscriptionPrice } from "../../hooks/subscriptions"
import LoadingSpinner from "../../../components/loading-spinner"
import { createPreference } from "../../../actions/payments"



export default function DonationPage() {
    const [choice, setChoice] = useState("none")
    const [preferenceId, setPreferenceId] = useState<undefined | string>()
    const [donationAmount, setDonationAmount] = useState(1)
    const [amount, setAmount] = useState(1)
    const {user} = useUser()
    const price = useSubscriptionPrice()

    if(!price.price){
        return <LoadingSpinner/>
    }

    const activeSubscription = validSubscription(user)

    const minAmount = activeSubscription ? 0 : 1

    const validAmount = amount >= minAmount && donationAmount <= 200 && donationAmount >= 1 && (amount + donationAmount < price.price.remaining)

    async function onUniqueChosen(){
        setChoice("unique")
        const {id, error} = await createPreference(user.id, activeSubscription ? 0 : amount, donationAmount)
        if(error) return {error}
        setPreferenceId(id)
    }

    async function handleAmountChange(val){
        if(val === ''){
          setAmount(0)
        } else if(Number.isInteger(+val)){
          setAmount(val)
        }
    }

    async function handleDonationAmountChange(val){
        if(val === ''){
          setDonationAmount(0)
        } else if(Number.isInteger(+val)){
          setDonationAmount(val)
        }
    }


    const donationInput = <div className="mt-8">
        <div className="flex justify-center items-center">
            <h3>
                {activeSubscription ? <>Donar suscripciones</> : <>Comprar y donar suscripciones</>}
            </h3>
        </div>
        <div className="flex justify-center">
            <div className="w-72 lg:w-96">
                
                <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="text-[var(--text-light)] text-center text-sm py-8">
                            Cada suscripción donada se suma al pozo de suscripciones disponibles para quien lo necesite.
                        </div>

                        {!activeSubscription && <div className="mb-12 mt-12 flex flex-col items-center">
                            <label htmlFor="integer-input" className="font-medium text-gray-700 mb-2">
                            Meses de suscripción para vos
                            </label>
                            <IntegerInputPlusMinus
                                value={amount}
                                onChange={handleAmountChange}
                            />
                        </div>}

                        <label htmlFor="integer-input" className="mb-2 font-medium text-gray-700">
                            Meses de suscripción para donar
                        </label>
                        <IntegerInputPlusMinus
                            value={donationAmount}
                            onChange={handleDonationAmountChange}
                        />

                        <div className="mt-12">
                            Total: ${price.price.price * ((activeSubscription ? 0 : amount) + donationAmount)}.
                        </div>
                    </div>
                </div>
                
                {donationAmount > 200 && <div className="flex justify-center text-red-600 py-2">
                    Si querés donar más de 200 suscripciones contactate con nosotros.
                </div>}

                {amount + donationAmount > price.price.remaining && <div className="flex justify-center text-red-600 py-2">
                    Solo quedan {price.price.remaining} suscripciones a este precio.
                </div>}

                <div className="mt-12 flex justify-center items-center">
                    <div className="w-full">
                    
                        <div className="flex justify-center py-2">
                            <SubscriptionOptionButton
                                title="Continuar"
                                description=""
                                disabled={!validAmount}
                                onClick={onUniqueChosen}
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
        <button className="gray-btn" onClick={() => {setChoice("none"); }}>Volver</button>
    </div>

    const center = <>
        {choice == "unique" && uniqueChosen}
        {choice != "unique" && donationInput}
    </>

    return <ThreeColumnsLayout center={center}/>
}
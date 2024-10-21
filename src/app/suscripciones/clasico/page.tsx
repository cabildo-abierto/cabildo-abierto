"use client"
import Link from "next/link"
import SubscriptionOptionButton from "../../../components/subscription-option-button"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { useUser } from "../../hooks/user"
import { useState } from "react"
import { useSubscriptionPrice } from "../../hooks/subscriptions"
import { MPWallet } from "../../../components/mp-wallet"
import LoadingSpinner from "../../../components/loading-spinner"
import { IntegerInputPlusMinus } from "./integer-input-plus-minus"
import { nextPrice, validSubscription } from "../../../components/utils"
import { createPreference } from "../../../actions/payments"


function PagoUnico({preferenceId, months, total, onBack}: {preferenceId: string, months: number, total: number, onBack: () => void}) {

    const center = <div className="flex flex-col items-center text-center">
        <div className="mt-32">
            <div className="">
                <MPWallet preferenceId={preferenceId}/>
            </div>
        </div>

        <div className="flex justify-end items-center mt-4">
            <div>
                <button className="gray-btn" onClick={onBack}>
                    Volver
                </button>
                
            </div>
        </div>

    </div>

    return <ThreeColumnsLayout center={center}/>
}


export default function PlanClasico() {
    const user = useUser()
    const [preferenceId, setPreferenceId] = useState<string | undefined>()
    const [choice, setChoice] = useState("none")
    const price = useSubscriptionPrice()
    const [months, setMonths] = useState(1)

    const activeSubscription = validSubscription(user.user)

    async function onUniquePayment(){
        if(user.user){
            const {error, id} = await createPreference(user.user.id, months, 0)
            if(error) return {error}
            setPreferenceId(id)
            setChoice("unique")
        }
        return {}
    }

    function onChange(val){
      if(val === ''){
        setMonths(0)
      } else if(Number.isInteger(+val)){
        setMonths(val)
      }
    }

    if(!price.price){
        return <LoadingSpinner/>
    }

    let center = null
    if(choice == "unique"){
        center = <PagoUnico preferenceId={preferenceId} months={months} total={months*price.price.price} onBack={() => {setChoice("none")}}/>
    } else {
        center = <div className="flex justify-center">
            <div className="mt-8 w-72 lg:w-96">
                <div className="flex justify-center items-center">
                    <h2>
                        Comprar suscripciones
                    </h2>
                </div>

                <div className="mt-16 mb-16 flex justify-center items-center text-center">
                    ${price.price.price} por mes para obtener acceso ilimitado a toda la plataforma. Sin publicidad, sin algoritmos, sin bots, etc.
                </div>

                <div className="flex flex-col items-center content-container rounded bg-[var(--secondary-light)] py-2">
                    <label htmlFor="integer-input" className="text-gray-800 text-center">
                        {activeSubscription ? "Elegí la cantidad de meses para agregar a tu suscripción" : "Elegí la cantidad de meses de tu suscripción"}
                    </label>

                    <div className="py-4 flex flex-col items-center">
                        <IntegerInputPlusMinus value={months} onChange={onChange}/>
                    {price.price.remaining < months && <div className="text-center text-sm mt-2 text-red-600">
                        Solo quedan {price.price.remaining} suscripciones disponibles a este precio.
                    </div>
                    }
                    </div>

        
                    <div className="flex justify-center p-2 min-w-48">
                        Total: ${months*price.price.price}
                    </div>
                </div>

                <div className="text-center mt-8 text-[var(--text-light)]">
                    <p className="mt-8">Quedan <span className="">{price.price.remaining}</span> suscripciones a este precio. Podés comprar meses por adelantado para aprovechar el descuento (luego pasan a costar ${nextPrice(price.price.price)}).</p>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-full">
                        <div className="py-2">
                            <SubscriptionOptionButton
                                title="Continuar"
                                description=""
                                onClick={onUniquePayment}
                                disabled={!(0 < months && months < price.price.remaining)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center mt-4">
                    <div>
                        <Link href="/suscripciones"><button className="gray-btn">Volver</button></Link>
                    </div>
                </div>
            </div>
        </div>
    }

    return <ThreeColumnsLayout center={center}/>
}
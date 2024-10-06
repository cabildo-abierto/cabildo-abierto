"use client"
import Link from "next/link"
import SubscriptionOptionButton from "../../../components/subscription-option-button"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { createPreference } from "../../../actions/users"
import { useUser } from "../../hooks/user"
import { useState } from "react"
import { useSubscriptionPrice } from "../../hooks/subscriptions"
import { MPWallet } from "../../../components/mp-wallet"

function PagoUnico({preferenceId}: {preferenceId: string}) {
    const price = useSubscriptionPrice()

    const center = <div className="flex flex-col items-center text-center">
        <div className="mt-16">Estás comprando una suscripción mensual.</div>
        {price.price ? <div className="mt-8">Total: ${price.price.price}</div> : <></>}
        <div className="mt-8">
            <div className="w-64">
                <MPWallet preferenceId={preferenceId}/>
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

    async function onUniquePayment(){
        if(user.user){
            const id = await createPreference(user.user.id, 1, 0)
            setPreferenceId(id)
            setChoice("unique")
        }
    }

    if(choice == "unique"){
        return <PagoUnico preferenceId={preferenceId}/>
    }

    const center = <div className="flex justify-center"><div className="mt-8 w-72 lg:w-96">
            <div className="flex justify-center items-center">
                <h2>
                    El plan clásico
                </h2>
            </div>

            <div className="mt-16 mb-16 flex justify-center items-center">
                {price.price ? <>${price.price.price} por mes.</> : <></>}
            </div>

            <div className="flex justify-center items-center mt-2">
                <div className="w-full">
                
                <div className="py-2">
                    <SubscriptionOptionButton
                        title="Pago único"
                        description="Pagá un solo mes. Sin compromisos."
                        onClick={onUniquePayment}
                    />
                </div>
            
                <div className="py-2">
                <SubscriptionOptionButton
                    title="Pago automático"
                    description={"Próximamente."/*"Poné la tarjeta (o cualquier medio de pago) y olvidate."*/}
                    disabled={true}
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

    return <ThreeColumnsLayout center={center}/>
}
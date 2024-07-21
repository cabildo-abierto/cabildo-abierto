"use client"

import { buyAndUseSubscription, donateSubscriptions } from "@/actions/subscriptions";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { useRouter } from "next/navigation";
import React from "react";


export default function PagoUnico({params}) {
    const router = useRouter()
    const handlePayment = async () => {
        await buyAndUseSubscription()
        await donateSubscriptions(params.amount-1)
        router.push("/inicio")
    }

    const center = <>
        <div className="flex justify-center mt-16">Acá deberías ingresar tu medio de pago si lo hubiéramos implementado</div>
        <div className="flex justify-center mt-16">Vas a comprar una suscripción para vos y donar 
            {params.amount == 2 ? " una suscripción" : " " + (params.amount-1).toString() + " suscripciones"}</div>
        <div className="flex justify-center mt-8">{"Total: $"+1000*params.amount}</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        
        <div className="flex justify-center mt-8">
            <button className="large-btn py-16" onClick={handlePayment}>Pagar</button>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}

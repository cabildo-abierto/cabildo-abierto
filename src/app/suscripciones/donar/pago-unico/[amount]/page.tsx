"use client"

import { getUser } from "@/actions/get-user";
import { buyAndUseSubscription, donateSubscriptions } from "@/actions/subscriptions";
import { ThreeColumnsLayout } from "@/components/main-layout";
import PayButton from "@/components/pay-button";
import { useUser } from "@/components/user-provider";
import { validSubscription } from "@/components/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";


export default function PagoUnico({params}: any) {
    const router = useRouter()
    const [paying, setPaying] = useState(false)
    const {user, setUser} = useUser()

    const activeSubscription = validSubscription(user)
    
    const handlePayment = async () => {
        if(!user) return
        setPaying(true)
        if(!activeSubscription) {
            await buyAndUseSubscription(user.id)
            await donateSubscriptions(params.amount-1, user.id)
            setUser(await getUser())
        } else {
            await donateSubscriptions(params.amount, user.id)
            setUser(await getUser())
        }
        setPaying(false)
        router.push("/inicio")
    }

    const center = <>
        <div className="flex justify-center mt-16">Acá deberías ingresar tu medio de pago si lo hubiéramos implementado</div>
        {!activeSubscription ? <div className="flex justify-center mt-16">Vas a comprar una suscripción para vos y donar 
            {params.amount == 2 ? " una suscripción" : " " + (params.amount-1).toString() + " suscripciones"}</div>
         : <div className="flex justify-center mt-16">Vas a donar
            {params.amount == 1 ? " una suscripción" : " " + (params.amount).toString() + " suscripciones"}</div>
        }
        <div className="flex justify-center mt-8">{"Total: $"+1000*params.amount}</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        
        <div className="flex justify-center mt-8">
            <div className="px-2">
            <PayButton onClick={handlePayment} paying={paying}/>
            </div>
            <Link href="/suscripciones/donar"><button className="large-btn scale-btn">Volver</button></Link>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}

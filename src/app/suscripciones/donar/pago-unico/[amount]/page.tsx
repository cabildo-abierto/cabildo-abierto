import { getUser } from "@/actions/get-user";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { PayDonationButton } from "@/components/pay-donation-button";
import { validSubscription } from "@/components/utils";
import Link from "next/link";
import React from "react";


export default async function PagoUnico({params}: any) {
    const user = await getUser()

    const activeSubscription = validSubscription(user)

    const amount = activeSubscription ? params.amount : params.amount-1

    const center = <>
        <div className="flex justify-center mt-16">
            Acá deberías ingresar tu medio de pago si lo hubiéramos implementado
        </div>
        {!activeSubscription ? <div className="flex justify-center mt-16">Vas a comprar una suscripción para vos y donar 
            {params.amount == 2 ? " una suscripción" : " " + (amount).toString() + " suscripciones"}</div>
         : <div className="flex justify-center mt-16">Vas a donar
            {params.amount == 1 ? " una suscripción" : " " + (amount).toString() + " suscripciones"}</div>
        }
        <div className="flex justify-center mt-8">{"Total: $"+1000*amount}</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        
        <div className="flex justify-center mt-8">
            <div className="px-2">
            <PayDonationButton user={user}/>
            </div>
            <Link href="/suscripciones/donar"><button className="gray-btn">Volver</button></Link>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}

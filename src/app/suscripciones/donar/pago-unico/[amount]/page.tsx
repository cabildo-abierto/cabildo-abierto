import Link from "next/link";
import React from "react";
import { getUser } from "../../../../../actions/users";
import { PayDonationButton } from "../../../../../components/pay-donation-button";
import { ThreeColumnsLayout } from "../../../../../components/three-columns";
import { validSubscription } from "../../../../../components/utils";


export default async function PagoUnico({params}: any) {
    const user = await getUser()
    const activeSubscription = validSubscription(user)

    const donations = activeSubscription ? params.amount : params.amount-1

    const center = <>
        <div className="flex justify-center mt-16">
            Acá deberías ingresar tu medio de pago si lo hubiéramos implementado
        </div>
        {!activeSubscription ? <div className="flex justify-center mt-16">Vas a comprar una suscripción para vos y donar 
            {donations == 2 ? " una suscripción" : " " + (donations).toString() + " suscripciones"}</div>
         : <div className="flex justify-center mt-16">Vas a donar
            {donations == 1 ? " una suscripción" : " " + (donations).toString() + " suscripciones"}</div>
        }
        <div className="flex justify-center mt-8">{"Total: $"+1000*params.amount}</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        
        <div className="flex justify-center mt-8">
            <div className="px-2">
            <PayDonationButton amount={donations} oneForYou={!activeSubscription}/>
            </div>
            <Link href="/suscripciones/donar"><button className="gray-btn">Volver</button></Link>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}

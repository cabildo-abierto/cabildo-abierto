"use client"

import { addPayment } from "@/actions/subscriptions";
import { ThreeColumnsLayout } from "@/components/main-layout";


export default function PlanClasico() {

    const center = <>
        <div className="flex justify-center mt-16">Acá deberías ingresar tu medio de pago</div>
        <div className="flex justify-center mt-8">Total: $1000</div>
        <div className="flex justify-center mt-8">
        <button className="large-btn py-16" onClick={() => addPayment(1000)}>Pagar</button>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}
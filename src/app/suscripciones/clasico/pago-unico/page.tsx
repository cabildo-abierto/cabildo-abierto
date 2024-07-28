"use client"

import { getUser } from "@/actions/get-user";
import { buyAndUseSubscription } from "@/actions/subscriptions";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { useUser } from "@/components/user-provider";
import { validSubscription } from "@/components/utils";
import { useRouter } from "next/navigation";


export default function PlanClasicoPagoUnico() {
    const router = useRouter()
    const {user, setUser} = useUser()
    if(validSubscription(user)){
        router.push("/suscripciones")
        return <></>
    }
    
    const handlePayment = async () => {
        if(user){
            await buyAndUseSubscription(user.id)
            setUser(await getUser())
            router.push("/inicio")
        }
    }

    const center = <>
        <div className="flex justify-center mt-16">Acá ingresarías tu método de pago si lo hubiéramos implementado.</div>
        <div className="flex justify-center mt-8">Total: $1000</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        <div className="flex justify-center mt-8">
        <button className="large-btn py-16" onClick={handlePayment}>Pagar</button>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}
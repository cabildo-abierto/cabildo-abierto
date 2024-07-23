"use client"
import { getDonatedSubscription } from "@/actions/subscriptions"
import { ThreeColumnsLayout } from "@/components/main-layout"
import { usePoolSize } from "@/components/use-pool-size"
import { useRouter } from "next/navigation"


export default function PlanGratuito() {
    const router = useRouter()
    const poolSize = usePoolSize()

    const handlePayment = async () => {
        (await getDonatedSubscription()).then(() => {router.push("/inicio")})
    }

    const center = <>
        <div className="flex justify-center mt-8">Hay {poolSize} suscripciones disponibles para usar</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        <div className="flex justify-center mt-8">
        <button className="large-btn py-16" onClick={handlePayment}>Usar una suscripción pendiente</button>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}
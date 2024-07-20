import { getSubscriptionStatus } from "@/actions/subscriptions"
import { ThreeColumnsLayout } from "@/components/main-layout"
import Link from "next/link"
import { SubscriptionOptionButton } from "../page"


export default function PlanClasico() {

    const center = <div className="mt-8">
        <div className="flex justify-center items-center">
            <h2>
                El plan clásico
            </h2>
        </div>

        <div className="mt-16 flex justify-center items-center">
            $1000 por mes.
        </div>

        <div className="mt-32 flex justify-center text-gray-600">
            Pagá con Mercado Pago o tarjeta de débito y crédito de cualquier banco.
        </div>
        <div className="flex justify-center items-center mt-2">
            <div className="w-full">
            <SubscriptionOptionButton
                title="Pago único"
                description="Sin compromisos"
                href={"/suscripciones/clasico/pago-unico"}
            />
        
            <SubscriptionOptionButton
                title="Pago automático"
                description="Poné la tarjeta (o cualquier medio de pago) y olvidate."
                href={"/suscripciones/clasico/pago-automatico"}
            />
            </div>
        </div>
        <div className="flex justify-end items-center mt-4">
            <div>
                <Link href="/suscripciones"><button className="large-btn">Volver</button></Link>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={600}/>

}
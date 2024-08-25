"use client"

import { useSubscriptionPoolSize } from "@/app/hooks/subscriptions";
import { FreeSubscriptionButton } from "@/components/free-subcription-button"
import LoadingSpinner from "@/components/loading-spinner";
import { ThreeColumnsLayout } from "@/components/three-columns";
import Link from "next/link"


export default function PlanGratuito() {
    const poolSize = useSubscriptionPoolSize()

    if(poolSize.isLoading) return <LoadingSpinner/>

    let center = <></>
    if(poolSize.poolSize > 0){
        center = <>
        <div className="flex justify-center mt-8">
            <p className="text-gray-900">Hay <span className="font-bold">{poolSize.poolSize}</span> suscripciones disponibles en el sitio.</p>
        </div>
        <p className="flex justify-center mt-8">
            Fueron donadas por otros usuarios para quien lo necesite.
        </p> 
        <p className="flex justify-center mt-8">
            <FreeSubscriptionButton/>
        </p>
        </>
    } else {
        center = <>
        <p className="flex justify-center mt-32">
            Lamentablemente en este momento no hay suscripciones gratuitas disponibles en la página.
        </p>
        <div className="flex justify-center items-center mt-4">
            <div>
                <Link href="/suscripciones">
                    <button className="gray-btn">Volver</button>
                </Link>
            </div>
        </div>
        </>
    }
    

    return <ThreeColumnsLayout center={center}/>

}
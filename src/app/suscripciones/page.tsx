import { ThreeColumnsLayout } from "@/components/main-layout"
import SubscriptionPage from "@/components/subscription-page"
import Link from "next/link"


export default function Suscripciones() {

    const center = <div className="mt-8">
        <SubscriptionPage/>

        <div className="flex justify-center items-center blue-links py-8 text-lg">
            <Link href="/wiki/Cabildo_Abierto:_Suscripciones">Más información sobre las suscripciones</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={800}/>
}
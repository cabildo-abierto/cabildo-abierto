import { ThreeColumnsLayout } from "@/components/main-layout"
import SubscriptionPage from "@/components/subscription-page"
import Link from "next/link"


export default function Suscripciones() {

    const center = <div className="mt-8">
        <SubscriptionPage/>

        <div className="flex justify-center items-center py-8 editor-container text-xl">
            <Link href="/wiki/Cabildo_Abierto:_Suscripciones">Más información sobre las suscripciones</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={800}/>
}
import Link from "next/link"
import SubscriptionPage from "../../components/subscription-page"
import { ThreeColumnsLayout } from "../../components/three-columns"


export default function Suscripciones() {

    const center = <div className="mt-8">
        <SubscriptionPage/>

        <div className="flex justify-center items-center link py-8 text-lg">
            <Link href="/articulo/Cabildo_Abierto:_Suscripciones">Más información sobre las suscripciones</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}
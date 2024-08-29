
import { ThreeColumnsLayout } from "src/components/three-columns";
import SubscriptionPage from "src/components/subscription-page"
import Link from "next/link"


export default function Suscripciones() {

    const center = <div className="mt-8">
        <SubscriptionPage/>

        <div className="flex justify-center items-center link py-8 text-lg">
            <Link href="/articulo/Cabildo_Abierto:_Suscripciones">Más información sobre las suscripciones</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={800}/>
}
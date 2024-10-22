import SubscriptionPage from "../../components/subscription-page"
import { ThreeColumnsLayout } from "../../components/three-columns"


export default function Suscripciones() {

    const center = <div className="mt-8">
        <SubscriptionPage/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}
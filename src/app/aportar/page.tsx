import ActiveSubscription from "./active-subscription"
import { ThreeColumnsLayout } from "../../components/three-columns"


export default function Aportar() {

    const center = <div className="mt-8">
        <ActiveSubscription/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}
import { getSubscriptionPoolSize } from "@/actions/subscriptions"
import { FreeSubscriptionButton } from "@/components/free-subcription-button"
import { ThreeColumnsLayout } from "@/components/main-layout"


export default async function PlanGratuito() {
    const poolSize = await getSubscriptionPoolSize()

    const center = <>
        <div className="flex justify-center mt-8">Hay {poolSize} suscripciones disponibles para usar</div>
        <div className="flex justify-center mt-8">
        <FreeSubscriptionButton/>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}
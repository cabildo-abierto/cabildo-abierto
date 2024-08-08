import { getSubscriptionPoolSize } from "@/actions/subscriptions"
import { FreeSubscriptionButton } from "@/components/free-subcription-button"
import { ThreeColumnsLayout } from "@/components/main-layout"


export default async function PlanGratuito() {
    const poolSize = await getSubscriptionPoolSize()

    const center = <>
        <div className="flex justify-center mt-8">
            <p className="text-gray-900">Hay <span className="font-bold">{poolSize}</span> suscripciones disponibles en el sitio.</p>
        </div>
        <p className="flex justify-center mt-8">
            Fueron donadas por otros usuarios para quien lo necesite.</p>
        <p className="flex justify-center mt-8">
            <FreeSubscriptionButton/>
        </p>
    </>

    return <ThreeColumnsLayout center={center}/>

}
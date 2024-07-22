import { getUserById, getUserId } from "@/actions/get-user"
import { getSubscriptionPoolSize } from "@/actions/subscriptions"
import { ThreeColumnsLayout } from "@/components/main-layout"
import SubscriptionOptions from "@/components/subscription-options"
import { usePoolSize } from "@/components/use-pool-size"
import { validSubscription } from "@/components/utils"
import Link from "next/link"


const ActiveSubscription = async () => {
    const poolSize = await getSubscriptionPoolSize()
    
    return <div><div className="p-4 bg-gray-100 rounded-md shadow-md">
        <p className="text-gray-900 font-semibold">Tenés una suscripción activa</p>
    </div>
        <div className="flex justify-center py-8">
            <p className="text-gray-900">Hay <span className="font-bold">{poolSize}</span> suscripciones disponibles en el sitio.</p>
        </div>
    </div>
}


export default async function Suscripciones() {
    const userId = await getUserId()
    const user = await getUserById(userId)
    
    const valid = validSubscription(user)

    const center = <div className="mt-8">
        {valid ? <ActiveSubscription/>
             : <SubscriptionOptions/>}

        <div className="flex justify-center items-center py-8 editor-container text-xl">
            <Link href="/wiki/Cabildo_Abierto:_Suscripciones">Más información sobre las suscripciones</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={800}/>
}
import { getUserId, getUserStatusById } from "@/actions/get-user"
import { getSubscriptionPoolSize, getSubscriptionPrice } from "@/actions/subscriptions"
import { ThreeColumnsLayout } from "@/components/main-layout"
import SubscriptionOptionButton from "@/components/subscription-option-button"
import { getSubscriptionStatus } from "@/components/utils"
import Link from "next/link"

const SubscriptionOptions = ({price, available}) => {
    const desc = <>
    <div>Podés hacer un pago único o activar pagos recurrentes.</div></>

    const desc2 = <div>
        <span>Hay <span className="font-bold">{available}</span> disponibles para quien lo necesite.
        </span>
    </div>

    return <>
        <div className="flex justify-center items-center">
            <h2>
                Tres opciones para obtener tu suscripción
            </h2>
        </div>

        <div className="flex justify-center items-center mt-16">
            <div className="w-4/5">
            <SubscriptionOptionButton
                title="El plan clásico"
                description={desc}
                price={`$${price}`}
                href={"/suscripciones/clasico"}
            />

            <SubscriptionOptionButton
                title="Usá una suscripción donada"
                description={desc2}
                price="Gratis"
                href={"/suscripciones/pendiente"}
            />

            <SubscriptionOptionButton
                title="Hacé crecer Cabildo Abierto"
                description="Apoyá a la plataforma y a los creadores de contenido donando suscripciones."
                price={`Desde $${2*price}`}
                href={"/suscripciones/donar"}
            />
        </div>
        </div>
    </>
}


const ActiveSubscription = async () => {
    const available = getSubscriptionPoolSize()
    return <div><div className="p-4 bg-gray-100 rounded-md shadow-md">
        <p className="text-gray-900 font-semibold">Tenés una suscripción activa</p>
    </div>
        <div className="flex justify-center py-8">
            <p className="text-gray-900">Hay <span className="font-bold">{available}</span> suscripciones disponibles en el sitio.</p>
        </div>
    </div>
}


export default async function Suscripciones() {
    const userId = await getUserId()
    const userStatus = await getUserStatusById(userId)
    const status = getSubscriptionStatus(userStatus?.subscriptionsUsed)

    const price = await getSubscriptionPrice()
    const available = await getSubscriptionPoolSize()

    const center = <div className="mt-8">
        {status == "valid" ? <ActiveSubscription/>
             : <SubscriptionOptions price={price} available={available}/>}

        <div className="flex justify-center items-center py-8 editor-container text-xl">
            <Link href="/wiki/Cabildo_Abierto:_Suscripciones">Más información sobre las suscripciones</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={800}/>
}
"use client"
import SubscriptionOptionButton from "./subscription-option-button"
import { usePrice } from "./use-price"
import { usePoolSize } from "./use-pool-size"

const SubscriptionOptions = () => {
    const {price, setPrice} = usePrice()
    const {poolSize, setPoolSize} = usePoolSize()

    const desc = <div>
        Pagá una suscripción y llevá una suscripción
    </div>

    const desc2 = <div>
        <span>
            Hay <span className="font-bold">{poolSize ? poolSize : "[...]"}</span> disponibles para quien lo necesite.
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
                price={`$${price ? price : "..."}`}
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
                price={`Desde $${price ? 2*price : "..."}`}
                href={"/suscripciones/donar"}
            />
            <div className="flex justify-center">
                Todos los precios son mensuales y si querés podés pagar un único mes
            </div>
        </div>
        </div>
    </>
}

export default SubscriptionOptions
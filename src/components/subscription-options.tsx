"use client"
import { getSubscriptionPrice } from "./utils"
import SubscriptionOptionButton from "./subscription-option-button"
import Link from "next/link"
import { useSubscriptionPoolSize } from "../app/hooks/subscriptions"

const SubscriptionOptions = () => {
    const poolSize = useSubscriptionPoolSize()

    const desc2 = <div>
        <span>
            Hay <span className="font-bold">{poolSize.isLoading ? "?" : poolSize.poolSize}</span> suscripciones disponibles.
        </span>
    </div>

    return <>
        <div className="px-4 w-full">
            <div className="flex justify-center">
                <h2>
                    Elegí tu suscripción
                </h2>
            </div>

            <div className="flex justify-center mt-8">
                <p className="lg:w-96 w-64 link text-center">
                    Cabildo Abierto <Link href="/articulo/Cabildo_Abierto:_Suscripciones">se financia</Link> exclusivamente con suscripciones.
                </p>
            </div>
        </div>

        <div className="mt-8 flex flex-col">
            <div className="flex justify-center py-2">
                <SubscriptionOptionButton
                    title="El plan clásico"
                    description="Pagar una suscripción"
                    price={`$${getSubscriptionPrice()}`}
                    href={"/suscripciones/clasico"}
                />
            </div>

            <div className="flex justify-center py-2">
                <SubscriptionOptionButton
                    title="Continuar gratis"
                    description={desc2}
                    price="$0"
                    disabled={poolSize.poolSize == 0}
                    href={"/suscripciones/pendiente"}
                />
            </div>

            <div className="flex justify-center py-2">
                <SubscriptionOptionButton
                    title="Hacer crecer Cabildo Abierto"
                    description="Comprar y donar suscripciones"
                    disabled={true}
                    price={`Desde $${2*getSubscriptionPrice()}`}
                    href={"/suscripciones/donar"}
                />
            </div>
        </div>
    </>
}

export default SubscriptionOptions
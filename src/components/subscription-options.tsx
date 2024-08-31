"use client"
import { getSubscriptionPrice } from "./utils"
import SubscriptionOptionButton from "./subscription-option-button"
import { useSubscriptionPoolSize } from "src/app/hooks/subscriptions"
import LoadingSpinner from "./loading-spinner"

const SubscriptionOptions = () => {
    const poolSize = useSubscriptionPoolSize()

    if(poolSize.isLoading) return <LoadingSpinner/>
    const desc2 = <div>
        <span>
            Hay <span className="font-bold">{poolSize.poolSize}</span> suscripciones disponibles.
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
                <p className="lg:w-96 w-64">
                    Las suscripciones son la única fuente de financiamiento de Cabildo Abierto.
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
                    description="Comprar y donar"
                    price={`Desde $${2*getSubscriptionPrice()}`}
                    href={"/suscripciones/donar"}
                />
            </div>

            <div className="flex justify-center mt-8">
                <p className="lg:w-96 w-64">
                    Todas las suscripciones son mensuales y podés cancelar en cualquier momento. <br/>También podés hacer un pago único, sin compromisos.
                </p>
            </div>
        </div>
    </>
}

export default SubscriptionOptions
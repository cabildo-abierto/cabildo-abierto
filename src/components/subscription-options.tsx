import { getSubscriptionPrice } from "./utils"
import SubscriptionOptionButton from "./subscription-option-button"
import { getSubscriptionPoolSize } from "@/actions/subscriptions"

const SubscriptionOptions = async () => {
    const poolSize = await getSubscriptionPoolSize()

    const desc2 = <div>
        <span>
            Hay <span className="font-bold">{poolSize}</span> suscripciones disponibles.
        </span>
    </div>

    return <>
        <div className="px-4 w-full">
            <div className="flex justify-center">
                <h2>
                    Elegí tu suscripción
                </h2>
            </div>

            <div className="flex justify-center font-bold mt-8">
                <p className="lg:w-96 w-64">
                    Cabildo Abierto se sostiene únicamente con las suscripciones de sus usuarios.
                </p>
            </div>
        </div>

        <div className="mt-16 flex flex-col">
            <div className="flex justify-center">
                <SubscriptionOptionButton
                    title="El plan clásico"
                    description="Pagar una suscripción"
                    price={`$${getSubscriptionPrice()}`}
                    href={"/suscripciones/clasico"}
                />
            </div>

            <div className="flex justify-center">
                <SubscriptionOptionButton
                    title="Gratis"
                    description={desc2}
                    price="$0"
                    href={"/suscripciones/pendiente"}
                />
            </div>

            <div className="flex justify-center">
                <SubscriptionOptionButton
                    title="Hacé crecer Cabildo Abierto"
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
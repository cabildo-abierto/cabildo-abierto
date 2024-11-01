"use client"
import SubscriptionOptionButton from "./subscription-option-button"
import Link from "next/link"
import { useSubscriptionPoolSize, useSubscriptionPrice } from "../app/hooks/subscriptions"
import { useUser } from "../app/hooks/user"
import { buyAndUseSubscriptions } from "../actions/users"
import { useSWRConfig } from "swr"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, nextPrice } from "./utils"
import InfoPanel from "./info-panel"
import { Desplegable } from "./desplegable"
import { ExpandLessIcon, ExpandMoreIcon } from "./icons"




const SubscriptionOptions = ({setShowingFreeTrial}) => {
    const poolSize = useSubscriptionPoolSize()
    const price = useSubscriptionPrice()
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    if(!user) return <></>

    let desc2 = <div>
        <span>
            Cargando suscripciones disponibles...
        </span>
    </div>

    if(!poolSize.isLoading){
        if(poolSize.poolSize != 1){
            desc2 = <div>
                <div>
                    Hay <span className="font-bold">{poolSize.poolSize}</span> suscripciones disponibles.
                </div>
                <div className="text-gray-300">
                    Usalas si lo necesitás, fueron donadas por otros usuarios.
                </div>
            </div>
        } else {
            desc2 = <div>
                <span>
                    Hay <span className="font-bold">{poolSize.poolSize}</span> suscripción disponible.
                </span>
            </div>
        }
        
    }

    const desc3 = <div>
        <div>Comprar y donar suscripciones</div>
        <div className="text-gray-300 text-sm">Para que no le falte una suscripción a quien lo necesite.</div>
    </div>

    const desc0 = <div>
        <div>Empezá a usar la plataforma con un mes gratis</div>
        <div className="text-gray-300 text-sm">Disponible para la primera suscripción de cada usuario.</div>
    </div>

    async function getFreeTrial(){
        const {error} = await buyAndUseSubscriptions(user.id, 0, 1, null)
        if(error) return {error}
        setShowingFreeTrial(true)
        mutate("/api/user")
        return {}
    }

    if(!price.price){
        return <LoadingSpinner/>
    }

    const desc1 = <div>
        <div>Comprá uno o más meses de suscripción</div>
        <div className="text-gray-300 text-sm">Quedan {price.price.remaining} suscripciones con este descuento (luego costarán ${nextPrice(price.price.price)}).</div>
    </div>

    const whySubscriptions = <div className="text-sm sm:text-base flex flex-col justify-center mt-4 lg:w-96 w-64 link text-justify space-y-2 border rounded bg-[var(--secondary-light)] content-container p-2">
        <p>Tanto el desarrollo de la plataforma como la escritura de contenidos se financia exclusivamente con suscripciones mensuales.</p>

        <p>El 70% de tu suscripción se reparte entre los autores de los contenidos que te interesen (vos también podés ser autor/a).</p>

        <p>El resto se usa para el desarrollo y moderación de la plataforma.</p>

        <p className="flex justify-end"><Link href="/suscripciones">Leer más</Link></p>
    </div>

    return <>
        <div className="px-4 w-full flex flex-col justify-center items-center">
            <div className="flex justify-center">
                <h2>
                    Elegí tu suscripción
                </h2>
            </div>

            <div className="flex justify-center mt-6">
                <Desplegable
                    text={whySubscriptions}
                    btn={<div className="gray-btn">¿Por qué suscripciones? <ExpandMoreIcon/></div>}
                    btnOpen={<div className="gray-btn toggled">¿Por qué suscripciones? <ExpandLessIcon/></div>}
                />
            </div>
        </div>

        <div className="mt-4 flex flex-col">
            {user.subscriptionsUsed.length == 0 && <div className="flex justify-center py-2">
                <SubscriptionOptionButton
                    title="Prueba gratuita"
                    description={desc0}
                    price="$0"
                    onClick={getFreeTrial}
                />
            </div>}

            <div className="flex justify-center py-2">
                <SubscriptionOptionButton
                    title="Comprar tu suscripción"
                    description={desc1}
                    price={price.price ? `$${price.price.price} por mes` : ""}
                    href={"/suscripciones/clasico"}
                />
            </div>

            <div className="flex justify-center py-2">
                <SubscriptionOptionButton
                    title="Hacer crecer Cabildo Abierto"
                    description={desc3}
                    price={price.price ? `Desde $${2*price.price.price}` : ""}
                    href={"/suscripciones/donar"}
                />
            </div>

            {<div className="flex flex-col items-center justify-center py-2">
                {user.subscriptionsUsed.length == 0 && 
                <div className="flex flex-col justify-center lg:w-96 w-72 link text-center space-y-3 text-sm text-[var(--text-light)] mb-1">
                    <p>
                        Opción disponible cuando hayas usado tu prueba gratuita.
                    </p>
                </div>}
                <SubscriptionOptionButton
                    title="Usar una suscripción donada"
                    description={desc2}
                    price="$0"
                    disabled={poolSize.poolSize == 0 || user.subscriptionsUsed.length == 0}
                    href={"/suscripciones/pendiente"}
                />
            </div>}
        </div>
    </>
}

export default SubscriptionOptions
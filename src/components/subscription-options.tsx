"use client"
import SubscriptionOptionButton from "./subscription-option-button"
import Link from "next/link"
import { useSubscriptionPoolSize, useSubscriptionPrice } from "../app/hooks/subscriptions"
import { useUser } from "../app/hooks/user"
import { buyAndUseSubscription } from "../actions/users"
import { useSWRConfig } from "swr"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, nextPrice } from "./utils"




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
        await buyAndUseSubscription(user.id, 0, null)
        setShowingFreeTrial(true)
        mutate("/api/user")
    }

    if(!price.price){
        return <LoadingSpinner/>
    }

    const desc1 = <div>
        <div>Comprá uno o más meses de suscripción</div>
        <div className="text-gray-300 text-sm">Quedan {price.price.remaining} suscripciones con este descuento (luego costarán ${nextPrice(price.price.price)}).</div>
    </div>

    return <>
        <div className="px-4 w-full flex flex-col justify-center items-center">
            <div className="flex justify-center">
                <h2>
                    Elegí tu suscripción
                </h2>
            </div>

            <div className="flex flex-col justify-center mt-4 lg:w-96 w-64 link text-justify space-y-3">
                <p className="">
                    Cabildo Abierto está hecha para sus usuarios. Por eso, se financia exclusivamente con suscripciones.
                </p>
                <p>
                    Las suscripciones se usan para financiar el desarrollo de la plataforma y a los autores de los contenidos que leas. <Link href={articleUrl("Cabildo_Abierto:_Suscripciones")}>Leer más.</Link>
                </p>
                <p>
                    De todas formas, podés empezar con un mes gratis. Además, hay suscripciones que fueron donadas por otros usuarios y podés usarlas si lo necesitás.
                </p>
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
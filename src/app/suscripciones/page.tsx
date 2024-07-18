import { getSubscriptionStatus } from "@/actions/subscriptions"
import { ThreeColumnsLayout } from "@/components/main-layout"
import Link from "next/link"


export const SubscriptionOptionButton = ({title, description, price=null, href}) => {
    return <div className="flex-1 px-2">
        <Link href={href}>
            <button className="subscription-btn w-full">
                <div className="text-lg">{title}</div>
                <div className="text-gray-200 font-normal">{description}</div>
                {price && <div className="mt-3">
                <span className="rounded border border-2 border-gray-600 text-white px-2 py-1">{price}</span>
                </div>}
            </button>
        </Link>
    </div>
}

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
                href={"/suscripciones/gratis"}
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


const ActiveSubscription = () => {
    return <div className="p-4 bg-gray-100 rounded-md shadow-md">
        <p className="text-gray-900 font-semibold">Tenés una suscripción activa</p>
    </div>
}


export default async function Suscripciones() {
    const status = await getSubscriptionStatus()

    const price = 1000
    const available = 289

    const center = <div className="mt-8">
        {status == "valid" ? <ActiveSubscription/>
             : <SubscriptionOptions price={price} available={available}/>}

        <div className="flex justify-center items-center py-8 editor-container text-xl">
            <Link href="/wiki/Cabildo Abierto: Suscripciones">¿Cómo funcionan las suscripciones?</Link>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={800}/>
}


/*
<div className="mt-4">
            <ul className="styled-list">
                <li><span className="font-bold">Para financiar a quienes escriben lo que leés:</span> El 55% de los ingresos son para ellos y ellas, que te ofrecen contenido independiente y de calidad. Ojo, igual después podés elegir a quiénes financiar con tu suscripción.</li>
                <li><span className="font-bold">Para financiar el desarrollo de la plataforma:</span> El diseño está orientado a las necesidades de los usuarios, que son los únicos clientes.</li>
                <li><span className="font-bold">Para no ver publicidad:</span> Nuestro modelo de negocios no se basa en el espionaje en masa, y somos muy cuidadosos con tus datos.</li>
                <li><span className="font-bold">Porque sí:</span> Finalmente, porque ofrecemos un servicio que creemos tiene valor, y por lo tanto lo cobramos.</li>
            </ul>
        </div>

        <div className="mt-8 flex justify-center items-center">
            <h3>¿Cómo funcionan las suscripciones gratuitas?</h3>
        </div>

        <div className="mt-4">
            <ul className="styled-list">
                <li>
                    Cuando alguien elige hacer crecer a Cabildo Abierto con una donación, lo que dona se transforma en suscripciones gratuitas disponibles para quienes lo necesiten.
                </li>
                <li>
                    <span className="font-bold">Importante:</span> Los usuarios que usan una suscripción donada reciben la misma experiencia que los que pagan su sucripción, no hacemos favoritismos.
                </li>
            </ul>
        </div>*/
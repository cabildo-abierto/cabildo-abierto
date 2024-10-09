"use client"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoadingSpinner from './loading-spinner';
import { useSubscriptionPoolSize } from '../app/hooks/subscriptions';
import Link from 'next/link';
import { ThreeColumnsLayout } from './three-columns';
import { useUser } from '../app/hooks/user';
import { UserProps } from '../app/lib/definitions';
import { nextSubscriptionEnd } from './utils';
import { date } from 'zod';


const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


function dateToText(date: Date){
    return date.getDate() + " de " + meses[date.getMonth()] + " de " + date.getFullYear()
}


function getSubscriptionEndDate(user: UserProps){
    const extraMonths = user.subscriptionsBought.length
    const nextEnd = nextSubscriptionEnd(user, extraMonths)
    return dateToText(nextEnd)
}


const ActiveSubscription: React.FC = () => {
    const poolSize = useSubscriptionPoolSize()
    const user = useUser()

    if(poolSize.isLoading || user.isLoading){
        return <LoadingSpinner/>
    }
    const center = <div
        className="flex justify-center mb-2"
    >
        <div className="flex flex-col max-w-96">
            <div className="text-center">
                <h2>Suscripciones</h2>
            </div>
            <div className="flex flex-col content-container rounded px-8 mt-8">
                <div className="flex items-center justify-center border p-4 rounded mt-4">
                    <div className="mr-2 text-gray-700">
                        <CheckCircleOutlineIcon fontSize="large" />
                    </div>
                    <div className="flex flex-col justify-center items-start">
                        <p>Tenés una suscripción activa</p>
                        <p className="text-sm text-[var(--text-light)]">Termina el {getSubscriptionEndDate(user.user)}.</p>
                    </div>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <div className="flex justify-center">
                        <Link className="gray-btn font-bold w-64 h-12 flex justify-center items-center" href="/suscripciones/clasico">
                            <h4>Extender mi suscripción</h4>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex flex-col content-container rounded mt-4">
                <div className="flex flex-col items-center text-center mt-8 px-2">
                    <p>En este momento hay <span className="font-bold">{poolSize.poolSize}</span> suscripciones gratuitas disponibles en la página.</p>
                    <p className="py-4">Si te gusta la plataforma y querés que más personas participen, podés ayudar donando suscripciones.</p>
                </div>

                <div className="flex justify-center py-4">
                    <div className="flex justify-center">
                        <Link className="gray-btn font-bold w-64 h-12 flex justify-center items-center" href="/suscripciones/donar">
                            <h4>Donar suscripciones</h4>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ActiveSubscription
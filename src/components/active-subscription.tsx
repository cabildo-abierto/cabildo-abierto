"use client"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoadingSpinner from './loading-spinner';
import { useSubscriptionPoolSize } from '../app/hooks/subscriptions';
import Link from 'next/link';
import { ThreeColumnsLayout } from './three-columns';


const ActiveSubscription: React.FC = () => {
    const poolSize = useSubscriptionPoolSize()

    if(poolSize.isLoading){
        return <LoadingSpinner/>
    }
    const center = <div className="flex flex-col items-center">
        <div className="text-gray-700 flex items-center justify-center border p-4">
            <div className="mr-2">
                <CheckCircleOutlineIcon fontSize="large" />
            </div>
            <div className="flex flex-col justify-center items-start">
                Tenés una suscripción activa
            </div>
        </div>

        <div className="flex flex-col items-center text-center mt-8 max-w-96 px-2">
            <p>Hay <span className="font-bold">{poolSize.poolSize}</span> suscripciones gratuitas disponibles.</p>
            <p className="py-4">Si te gusta la plataforma y querés que más personas participen, podés ayudar donando suscripciones.</p>
        </div>

        <div className="flex justify-center mt-8">
            <div className="flex justify-center">
                <Link className="gray-btn font-bold w-32 h-12 mb-8 flex justify-center items-center" href="/suscripciones/donar">
                    Donar
                </Link>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default ActiveSubscription
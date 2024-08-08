import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SubscriptionOptionButton from "./subscription-option-button";
import { getSubscriptionPoolSize } from '@/actions/subscriptions';

const ActiveSubscription: React.FC = async () => {
    const poolSize = await getSubscriptionPoolSize()

    return <div>
        <div className="text-gray-700 flex items-center justify-center border w-96 mx-auto p-4">
            <div className="mr-2">
                <CheckCircleOutlineIcon fontSize="large" />
            </div>
            <div className="flex flex-col justify-center items-start">
                Tenés una suscripción activa
            </div>
        </div>

        <div className="flex justify-center py-8">
            <p className="text-gray-900">Hay <span className="font-bold">{poolSize}</span> suscripciones disponibles en el sitio.</p>
        </div>

        <div className="flex justify-center py-8">
            <div className="w-1/2">
                <SubscriptionOptionButton
                    title="Donar suscripciones"
                    description="Para hacer crecer la discusión"
                    href="/suscripciones/donar"
                />
            </div>
        </div>
    </div>
}

export default ActiveSubscription
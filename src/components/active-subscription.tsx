
import { usePoolSize } from "@/components/use-pool-size"

const ActiveSubscription: React.FC = () => {
    const {poolSize, setPoolSize} = usePoolSize()
    
    return <div><div className="p-4 bg-gray-100 rounded-md shadow-md">
        <p className="text-gray-900 font-semibold">Tenés una suscripción activa</p>
    </div>
        <div className="flex justify-center py-8">
            <p className="text-gray-900">Hay <span className="font-bold">{poolSize}</span> suscripciones disponibles en el sitio.</p>
        </div>
    </div>
}

export default ActiveSubscription
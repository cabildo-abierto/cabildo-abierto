import Link from 'next/link';
import ConstructionIcon from '@mui/icons-material/Construction';

export const Presentation: React.FC = () => {
    return <div className="flex-col justify-between">
        <div className="flex justify-center">
            <div className="">
                <h1 className="text-5xl font-bold text-gray-900">Cabildo Abierto</h1>
            
                <h3 className="mt-2 text-gray-700">Información abierta a discusión</h3>
            </div>
        </div>
        <div className="flex justify-center">
            <div className="mt-16 px-4 max-w-96">
            <div className="text-gray-700 flex items-center border p-2">
                <div className="mr-2">
                    <ConstructionIcon fontSize="large" />
                </div>
                <div className="flex justify-center">
                    La plataforma está en período de prueba cerrada. Podés escribirnos a contacto@cabildoabierto.com.ar
                </div>
            </div>
            </div>
        </div>
        <div className="flex justify-center mt-8">
            <Link href="/wiki/Cabildo_Abierto">
                <button className="large-btn">¿Qué es Cabildo Abierto?</button>
            </Link>
        </div>
    </div>
};

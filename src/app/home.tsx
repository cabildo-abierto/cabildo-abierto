import Link from 'next/link';
import ConstructionIcon from '@mui/icons-material/Construction';

export const Home: React.FC = () => {
    return <div className="flex-col justify-between">
            <div className="">
                <div className="flex justify-center">
                    <h1 className="text-6xl font-bold text-gray-900">Cabildo Abierto</h1>
                </div>
                <div className="flex justify-center">
                    <p className="mt-4 text-3xl text-gray-700">Información abierta a discusión.</p>
                </div>
            </div>
            <div className="flex justify-center mt-16">
                <Link href="/wiki/Cabildo_Abierto">
                    <button className="large-btn">¿Qué es Cabildo Abierto?</button>
                </Link>
            </div>
            <div className="flex justify-center mt-16">
                <div className="text-gray-700 flex items-center border p-4">
                    <div className="mr-2">
                        <ConstructionIcon fontSize="large" />
                    </div>
                    <div className="flex flex-col justify-center items-start">
                        <div>La plataforma está en período de prueba cerrada.</div>
                        <div>Escribinos a <span className="">contacto@cabildoabierto.com.ar</span></div>
                    </div>
                </div>
            </div>
    </div>
};

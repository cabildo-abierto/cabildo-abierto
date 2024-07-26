import Link from 'next/link';
import ConstructionIcon from '@mui/icons-material/Construction';

export const Home: React.FC = () => {
    return (
        <div className="flex justify-center">
            <div>
                <h1 className="text-6xl font-bold text-gray-900">Cabildo Abierto</h1>
                <p className="mt-4 text-3xl text-gray-700">Discutí lo público.</p>
                <div className="mt-32 flex justify-center mb-16">
                    <Link href="/wiki/Cabildo_Abierto">
                        <button className="large-btn">¿Qué es Cabildo Abierto?</button>
                    </Link>
                </div>
                <div className="text-gray-700 flex items-center justify-center border w-96 mx-auto p-4">
                    <div className="mr-2">
                        <ConstructionIcon fontSize="large" />
                    </div>
                    <div className="flex flex-col justify-center items-start">
                        <div>La plataforma está en período de prueba.</div>
                        <div>Escribinos a <span className="italic">contacto@cabildoabierto.com</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

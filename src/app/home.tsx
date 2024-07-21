import {Typewriter} from "nextjs-simple-typewriter";
import Image from "next/image";
import Link from "next/link";



export const Home: React.FC = () => {
    return <div className="flex justify-center">
        <div>
        <h1 className="text-6xl font-bold text-gray-900">Cabildo Abierto</h1>
        <p className="mt-4 text-3xl text-gray-700">
            Discutí lo público.
        </p>
        <div className="mt-32 flex justify-center">
            <Link href="/wiki/Cabildo_Abierto">
                <button className="large-btn">
                        ¿Qué es Cabildo Abierto?
                </button>
            </Link>
        </div>
        </div>
    </div>
}
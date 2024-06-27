import {Typewriter} from "nextjs-simple-typewriter";
import Image from "next/image";


export const Home2: React.FC = () => {
    return <div className="w-3/4 px-16 py-12">
        <h1 className="text-4xl font-bold text-gray-900">Cabildo Abierto</h1>
        <div className="mt-4 text-2xl text-gray-700">
            Discutimos política.
        </div>
        <div className="absolute left-0 top-3 -z-10">
            <Image
                src="/parthenon1.png"
                alt="parthenon"
                width={700}
                height={700}
                priority
            />
        </div>
    </div>
}


export const Home: React.FC = () => {
    return <div className="flex justify-center">
        <div>
            <h1 className="text-6xl font-bold text-gray-900">Cabildo Abierto</h1>
            
            <p className="mt-4 text-3xl text-gray-700">
                Discutimos política.
            </p>
        </div>
    </div>
}
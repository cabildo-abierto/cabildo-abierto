import {Typewriter} from "nextjs-simple-typewriter";
import Image from "next/image";


export default function Home() {
    return <div className="w-3/4 px-16 py-16">
        <h1 className="text-4xl font-bold text-gray-900">Cabildo Abierto</h1>
        <div className="mt-4 text-2xl text-gray-700">
            <Typewriter
                words={["Informate", "Informá", "Discutí"]}
                loop={0}
                cursor
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
            />
        </div>
        <div className="absolute left-0 top-0 -z-10">
            <Image
                src="/parthenon1.png"
                alt="parthenon"
                width={800}
                height={800}
                priority
            />
        </div>
    </div>
}
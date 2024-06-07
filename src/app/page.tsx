import SignupForm from "./signup-form";
import Link from "next/link";
import {Typewriter} from "nextjs-simple-typewriter";
import Image from "next/image";

export default function HomePage() {
    return (
        <div className="flex">
            <div className="w-3/4 px-16 py-16">
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
                        width={700}
                        height={700}
                        priority
                    />
                </div>
            </div>
            <div className="w-1/2 flex justify-center">
                <div className="w-1/2 mr-8 py-16">
                    <SignupForm/>
                    <div className='mt-4 text-center'>
                        Ya tenés una cuenta?{' '} <Link href="/login" className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline'>
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
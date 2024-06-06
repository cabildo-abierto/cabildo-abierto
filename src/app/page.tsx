import SignupForm from "./signup-form";
import Link from "next/link";
import Home from "@/app/home";

export default function HomePage() {
    return (
        <div className="flex">
            <Home/>
            <div className="w-1/2 flex justify-center">
                <div className="w-1/2 mr-8 py-32">
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
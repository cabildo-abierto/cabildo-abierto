import Footer from "@/components/footer";
import { Home } from "../home";
import SignupForm from "./signup-form"
import Link from "next/link";

export default function SignupPage() {
    return <div className="h-screen flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between">
            <div className="w-full lg:w-1/2 mt-24">
                <Home/>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-3/4 lg:w-1/2 mr-8 mt-24">
                    <SignupForm/>
                    <div className='mt-4 mb-8 text-center'>
                        Ya tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/signup">Iniciá sesión</Link>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col justify-end h-full">
            <Footer/>
        </div>
    </div>
}
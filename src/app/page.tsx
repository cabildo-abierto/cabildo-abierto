import { Home } from "./home";
import LoginForm from "../components/login-form";
import Link from "next/link";
import Footer from "@/components/footer";


export default function HomePage() {
    return <div className="h-screen flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between">
            <div className="w-full lg:w-1/2 mt-24">
                <Home/>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-3/4 lg:w-1/2 mr-8 mt-24">
                    <LoginForm/>
                    <div className='mt-4 mb-8 text-center'>
                        No tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/signup">Registrate</Link>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col justify-end h-full">
            <Footer/>
        </div>
    </div>
}
import { Presentation } from "@/app/presentation"
import LoginForm from "./login-form"
import Link from "next/link"
import Footer from "./footer"
import SignupForm from "@/components/signup-form"


export const HomePage = ({signup}: {signup: boolean}) => {
    return <div className="h-screen flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between">
            <div className="w-full lg:w-1/2 mt-24">
                <Presentation/>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-3/4 lg:w-1/2 lg:mt-24 mt-8 max-w-96">
                    {signup ? 
                    <>
                        <SignupForm/>
                        <div className='mt-4 mb-8 text-center'>
                            Ya tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/">Iniciá sesión</Link>
                        </div>
                    </>
                    : 
                    <>
                        <LoginForm/>
                        <div className='mt-4 mb-8 text-center'>
                            No tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/signup">Registrate</Link>
                        </div>
                    </>
                    }
                </div>
            </div>
        </div>
        <div className="flex flex-col justify-end h-full">
            <Footer/>
        </div>
    </div>
}
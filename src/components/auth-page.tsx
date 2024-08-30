"use client"
import Link from "next/link"
import { Logo, LogoWithName } from "./home-page"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import { createClient } from "src/utils/supabase/client"
import Footer from "./footer"



export const AuthPage = ({signup}: {signup: boolean}) => {
    return <div className="flex flex-col h-screen w-screen">
        <div className="topbar-container">
            <LogoWithName/>
        </div>
        <div className="flex flex-col items-center h-screen-minus-16 w-screen">
            <div className="flex flex-col h-full justify-center">
                {signup ? <>
                <SignupForm/>
                <div className='mt-4 mb-4 text-center'>
                    Ya tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/login">Iniciá sesión</Link>
                </div>
                </>
                :<>
                <LoginForm/>
                <div className='mt-4 mb-4 text-center'>
                    No tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/signup">Registrate</Link>
                </div>
                </>
                }
            </div>
            <div className="w-screen h-6">
                <Footer/>
            </div>
        </div>
    </div>
}
"use client"
import Link from "next/link"
import { Logo, LogoWithName } from "./home-page"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import { createClient } from "src/utils/supabase/client"



export const AuthPage = ({signup}: {signup: boolean}) => {
    return <div className="">
        <div className="topbar-container">
            <LogoWithName/>
        </div>
    <div className="flex justify-center items-center h-screen-minus-16 w-screen">
        <div className="flex flex-col">
        {signup ? <>
        <SignupForm/>
        <div className='mt-4 mb-8 text-center'>
            Ya tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/login">Iniciá sesión</Link>
        </div>
        </>
        :<>
        <LoginForm/>
        <div className='mt-4 mb-8 text-center'>
            No tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/signup">Registrate</Link>
        </div>
        </>
        }
        </div>
    </div>
    </div>
}
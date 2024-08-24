"use client"
import Link from "next/link"
import { Logo, LogoWithName } from "./home-page"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import { createClient } from "@/utils/supabase/client"



export const AuthPage = ({signup}: {signup: boolean}) => {
    const supabase = createClient()
    async function google() {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: "https://ipkthbrawgjwaeqvlbjk.supabase.co/auth/v1/callback",
            },
        })
    }

    return <div className="">
        <div className="border-b w-screen py-2">
            <Link href="/">
                <LogoWithName/>
            </Link>
        </div>
    <div className="flex justify-center items-center h-screen-minus-16 w-screen">
        <div className="flex flex-col">
        <div>
            <button onClick={google}>Google</button>
        </div>
        
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
"use client"
import Link from "next/link"
import { TopbarExternal } from "./home-page"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import Footer from "./footer"



export const AuthPage = ({signup}: {signup: boolean}) => {
    const linkClassName = "underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline"
    
    return <div className="flex flex-col">
        <TopbarExternal showButtons={false}/>
        <div className="flex flex-col items-center justify-between h-full">
            <div className="flex flex-col items-center h-full justify-center">
                {
                    signup ? <>
                    <SignupForm/>
                    <div className='mt-4 text-center'>
                        Ya tenés una cuenta? <Link className={linkClassName} href="/login">Iniciá sesión</Link>.
                    </div>
                    </>
                    :<div className="mt-20">
                    <LoginForm/>
                    <div className='mt-4 text-center'>
                        No tenés una cuenta? <Link className={linkClassName} href="/signup">Registrate</Link>.
                    </div>
                    </div>
                }
                <div className="text-center mb-2">
                    O volvé al <Link href="/" className={linkClassName}>inicio</Link>.
                </div>
            </div>
            <Footer/>
        </div>
    </div>
}
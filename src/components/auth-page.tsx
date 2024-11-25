"use client"
import { BlueskyLogin } from './bsky-login';
import { CustomLink as Link } from './custom-link';
import Footer from './footer';
import LoginForm from "./login-form"
import { Logo, TopbarLogo } from './logo';
import { LogoAndSlogan } from './presentation';
import SignupForm from "./signup-form"


export const AuthPage = ({state}: {state: "login" | "signup"}) => {

    return <div className="flex flex-col items-center h-screen justify-between">

        <div className="flex flex-col h-full items-center justify-center">
            <div className="mb-8">
            <TopbarLogo className="w-20 h-20 m-2"/>
            </div>
        {

            state == "signup" ? <>
            <SignupForm/>
            <div className='mt-4 text-center pb-4'>
                ¿Ya tenés una cuenta? <Link className="link2" href="/login">Iniciá sesión</Link>.
            </div>
            </>
            : <>
            <BlueskyLogin/>
            </>
        }
        </div>
        <Footer/>
    </div>
}
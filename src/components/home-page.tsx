"use client"

import { PeriodoDePrueba, Presentation } from "@/app/presentation"
import Link from "next/link"
import Footer from "./footer"
import Image from 'next/image'


export const LogoWithName = () => {
    return <Link href="/"><div className="flex items-center py-2 px-2 w-16 h-16">
        <Logo/>
        <p className={"flex justify-center logo content"}>Cabildo<br/>Abierto</p>
    </div></Link>
}



export const Logo = ({className = ""}: {className?: string}) => {
    return <Image
          src="/favicon.ico"
          alt="Loading..."
          width={397}
          height={397}
          priority={true}
          className={"object-contain "+className}
    />
}

export const LoginButton = ({className=""}: {className?: string}) => {
    return <Link href="/login">
        <button className={"gray-btn "+className}>
            Iniciar sesión
        </button>
    </Link>
}

export const SignupButton = ({className="", text="Crear una cuenta"}: {className?: string, text?: string}) => {
    return <Link href="/signup">
        <button className={"gray-btn mx-2 "+className}>
            {text}
        </button>
    </Link>
}

const Topbar = () => {
    return <div className="flex justify-between items-center">
        <Logo/>
        <div>
        <LoginButton/>
        <SignupButton/>
        </div>
    </div>
}


export const HomePage = () => {

    return <div className="h-screen flex flex-col">
        <Topbar/>
        <Presentation/>
        <div className="flex flex-col justify-end h-full">
            <Footer/>
        </div>
    </div>
}

/* 



        <div className="flex flex-col lg:flex-row justify-between">
            <div className="w-full lg:w-1/2 flex justify-center lg:h-screen items-center">
                <div className="w-3/4 lg:w-1/2 max-w-96">
                    <div className="mb-4">
                    {false && <PeriodoDePrueba/>}
                    </div>
                    {state == "signup" &&
                    <>
                        <SignupForm/>
                        <div className='mt-4 mb-8 text-center'>
                            Ya tenés una cuenta? <button className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' onClick={() => {setState("login")}}>Iniciá sesión</button>
                        </div>
                    </>}
                    {state == "login" && <>
                        <LoginForm/>
                        <div className='mt-4 mb-8 text-center'>
                            No tenés una cuenta? <button className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' onClick={() => {setState("signup")}}>Registrate</button>
                        </div>
                    </>}
                    {state == "" && <div className="flex flex-col space-y-4">
                        <button className="gray-btn h-16 text-lg" onClick={() => {setState("login")}}>
                            Iniciar sesión
                        </button>
                        <button className="gray-btn h-16 text-lg" onClick={() => setState("signup")}>
                            Crear una cuenta
                        </button>
                    </div>}
                </div>
            </div>
        </div>


        */
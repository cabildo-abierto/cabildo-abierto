"use client"

import { Presentation } from "@/app/presentation"
import Link from "next/link"
import Footer from "./footer"
import Image from 'next/image'


export const LogoWithName = () => {
    return <div><Link href="/"><div className="flex items-center px-2">
        <Image
          src="/logo-texto.png"
          alt="Loading..."
          width={796}
          height={291}
          priority={true}
          className="w-24"
        />
    </div></Link></div>
}



export const Logo = ({className}: {className: string}) => {
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
        <button className={className}>
            Iniciar sesión
        </button>
    </Link>
}

export const SignupButton = ({className="", text="Crear cuenta"}: {className?: string, text?: string}) => {
    return <Link href="/signup">
        <button className={className}>
            {text}
        </button>
    </Link>
}

const Topbar = () => {
    return <div className="topbar-container">
        <LogoWithName/>
        <div className="flex items-center">
            <LoginButton className="auth-btn h-10 mr-2"/>
            <SignupButton className="auth-btn h-10 mr-2"/>
        </div>
    </div>
}


export const HomePage = () => {
    return <div className="h-screen">
        <Topbar/>
        <div className="flex flex-col justify-between h-screen-minus-16">
        <Presentation/>
        <Footer/>
        </div>
    </div>
}
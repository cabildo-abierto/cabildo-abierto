"use client"

import Link from "next/link"
import Footer from "./footer"
import Image from 'next/image'
import { Presentation } from "src/app/presentation"


export const LogoWithName = ({showName}: {showName: boolean}) => {
    return <div><Link href="/"><div className="flex items-center px-2">
        <Image
          src="/favicon.ico"
          alt="Loading..."
          width={314}
          height={314}
          priority={true}
          className="w-12"
        />
        {showName && <div className="ml-1 items-end text-lg text-gray-900 hidden sm:flex">
            <div>Cabildo Abierto</div>
        </div>}
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

export const TopbarExternal = ({showButtons}: {showButtons: boolean}) => {
    return <div className="topbar-container">
        <LogoWithName showName={false}/>
        {showButtons && <div className="flex items-center justify-center">
            <LoginButton className="auth-btn h-10 mr-2"/>
            <SignupButton className="auth-btn h-10 mr-2"/>
        </div>}
    </div>
}


export const HomePage = () => {
    return <div className="flex flex-col">
        <TopbarExternal showButtons={true}/>
        <div className="flex flex-col justify-between h-full">
            <Presentation/>
            <Footer/>
        </div>
    </div>
}
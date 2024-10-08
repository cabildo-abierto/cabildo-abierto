"use client"
import Link from "next/link"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import { useState } from "react"


export const AuthPage = ({startInLogin}: {startInLogin?: boolean}) => {
    const [hasAccount, setHasAccount] = useState(startInLogin)
    
    return <div className="flex flex-col items-center justify-center py-12 h-full">
        {
            !hasAccount ? <>
            <SignupForm/>
            <div className='mt-4 text-center pb-4'>
                Ya tenés una cuenta? <button className="link2" onClick={() => {setHasAccount(true)}}>Iniciá sesión</button>.
            </div>
            </>
            :<>
            <LoginForm/>
            <div className='mt-2 text-center'>
                <Link href="/recuperar" className="link2">Recuperar contraseña</Link>.
            </div>
            <div className='text-center'>
                No tenés una cuenta? <button className="link2" onClick={() => {setHasAccount(false)}}>Registrate</button>.
            </div>
            </>
        }
    </div>
}
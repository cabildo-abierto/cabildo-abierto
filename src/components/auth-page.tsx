"use client"
import Link from "next/link"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import { useState } from "react"


export const AuthPage = () => {
    const [hasAccount, setHasAccount] = useState(false)
    
    return <div className="flex flex-col items-center justify-center h-screen">
        {
            !hasAccount ? <>
            <SignupForm/>
            <div className='mt-4 text-center'>
                Ya tenés una cuenta? <button className="link2" onClick={() => {setHasAccount(true)}}>Iniciá sesión</button>.
            </div>
            </>
            :<>
            <LoginForm/>
            <div className='mt-4 text-center'>
                No tenés una cuenta? <button className="link2" onClick={() => {setHasAccount(false)}}>Registrate</button>.
            </div>
            </>
        }
    </div>
}
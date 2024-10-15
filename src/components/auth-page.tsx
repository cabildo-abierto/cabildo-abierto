"use client"
import Link from "next/link"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"


export const AuthPage = ({loggingIn, setLoggingIn}: {loggingIn?: boolean, setLoggingIn: (v: boolean) => void}) => {
    
    return <div className="flex flex-col items-center justify-center py-12 h-full">
        {
            !loggingIn ? <>
            <SignupForm/>
            <div className='mt-4 text-center pb-4'>
                Ya tenés una cuenta? <button className="link2" onClick={() => {setLoggingIn(true)}}>Iniciá sesión</button>.
            </div>
            </>
            :<>
            <LoginForm/>
            <div className='mt-2 text-center'>
                <Link href="/recuperar" className="link2">Recuperar contraseña</Link>.
            </div>
            <div className='text-center'>
                No tenés una cuenta? <button className="link2" onClick={() => {setLoggingIn(false)}}>Registrate</button>.
            </div>
            </>
        }
    </div>
}
"use client"
import { useFormState, useFormStatus } from "react-dom";
import { LoginButton } from "./login-button";
import { AuthForm, EmailInput, PasswordInput } from "./signup-form";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { login, LoginFormState } from "../actions/auth";
import ResendEmailButton from "./resend-email-button";
import { useState } from "react";


const LoginFormError = ({state}: {state: LoginFormState}) => {
    const {pending} = useFormStatus()

    let errorComponent = <div className="h-6"></div>

    if(!pending && state && state.error == "invalid auth"){
        errorComponent = <div className="flex items-center text-red-600 h-6 px-2">Usuario o contraseña incorrectos.</div>
    }
    if(!pending && state && state.error == "no connection"){
        errorComponent = <div className="flex items-center text-red-600 h-6 px-2">
            Ocurrió un error en la conexión.
        </div>
    }
    if(!pending && state && state.error == "not confirmed"){
        errorComponent = <div className="flex flex-col items-center px-2 justify-center text-center">
            <span className="text-red-600">Confirmá tu mail para iniciar sesión.</span>
            <span><ResendEmailButton email={state.data.email}/></span>
        </div>   
    }
    if(!pending && state && state.error == "api error"){
        errorComponent = <div className="flex items-center text-red-600 h-6 px-2">Volvé a intentar más tarde.</div>
    }

    return errorComponent
}


export default function LoginForm() {
    const {mutate} = useSWRConfig()
    const router = useRouter()

    const origAction = async (state: any, payload: any) => {
        const result = await login(state, payload)
        if(result.user){
            await mutate("/api/user", result.user)
            router.push("/inicio")
        }
        return result
    }
    const [state, action] = useFormState(origAction, undefined)

    return (
        <>
            <AuthForm
                title="Iniciar sesión"
                state={state}
                action={action}
            >
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                <LoginFormError state={state}/>
                <LoginButton/>
            </AuthForm>
        </>
    )
}
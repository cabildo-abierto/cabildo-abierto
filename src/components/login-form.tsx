"use client"
import { useFormState } from "react-dom";
import { LoginButton } from "./login-button";
import { AuthForm, EmailInput, PasswordInput } from "./signup-form";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { login } from "../actions/auth";
import ResendEmailButton from "./resend-email-button";


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

    let error = <div className="h-6"></div>

    if(state && state.error == "invalid auth"){
        error = <div className="flex items-center text-red-600 h-6 px-2">Usuario o contraseña incorrectos.</div>
    }
    if(state && state.error == "no connection"){
        error = <div className="flex items-center text-red-600 h-6 px-2">Ocurrió un error en la conexión.</div>   
    }
    if(state && state.error == "not confirmed"){
        error = <div className="flex items-center px-2">
            <div>
            <span className="text-red-600">Confirmá tu mail para iniciar sesión.</span>
            <ResendEmailButton email={state.data.email}/>
            </div>
        </div>   
    }

    return (
        <>
            <AuthForm
                title="Iniciar sesión"
                state={state}
                action={action}
            >
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                {error}
                <LoginButton/>
            </AuthForm>
        </>
    )
}
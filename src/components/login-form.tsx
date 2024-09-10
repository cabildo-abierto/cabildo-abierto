"use client"
import { useFormState } from "react-dom";
import { LoginButton } from "./login-button";
import { AuthForm, EmailInput, PasswordInput } from "./signup-form";
import { login } from "src/actions/auth";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

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
        <div className="w-96">
            <AuthForm
                title="Iniciar sesión"
                state={state}
                action={action}
            >
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                {(state && state.error == "invalid auth") ? 
                    <div className="flex items-center text-red-600 h-6 px-2">Usuario o contraseña incorrectos.</div>
                    :
                    <div className="h-6"></div>
                }
                <LoginButton/>
            </AuthForm>
        </div>
    )
}
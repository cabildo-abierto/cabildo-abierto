"use client"
import { useFormState } from "react-dom";
import { LoginButton } from "./login-button";
import { AuthenticationFormLabel, AuthForm, EmailInput, PasswordInput } from "./signup-form";
import { useRouter } from "next/navigation";
import { validSubscription } from "./utils";
import { login } from "src/actions/auth";

export default function LoginForm() {
    const [state, action] = useFormState(login, undefined)

    return (
        <div className="">
            <AuthForm
                title="Iniciar sesión"
                state={state}
                action={action}
            >
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                {(state && state.error == "invalid auth") ? 
                    <div className="flex items-center text-red-600 h-10 px-2">Usuario o contraseña incorrectos.</div>
                    :
                    <div className="h-10"></div>
                }
                <LoginButton/>
            </AuthForm>
        </div>
    )
}
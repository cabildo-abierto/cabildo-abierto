"use client"
import { useFormState } from "react-dom";
import { LoginButton } from "./login-button";
import { AuthenticationFormLabel } from "./signup-form";
import { useRouter } from "next/navigation";
import { validSubscription } from "./utils";
import { login } from "src/actions/auth";

export default function LoginForm() {
    const [state, action] = useFormState(login, undefined)
    const router = useRouter()


    const handleEmailInput = (e: any) => {
        const email = e.target;
        email.setCustomValidity('');
        if (!email.validity.valid) {
            email.setCustomValidity('Ingresá un correo electrónico válido.');
        }
    };

    const handlePasswordInput = (e: any) => {
        const email = e.target;
        email.setCustomValidity('');
        if (!email.validity.valid) {
            email.setCustomValidity('Ingresá una contraseña.');
        }
    };

    return (
        <div className="">
            <div className="flex-1 rounded-lg bg-[var(--secondary-light)] px-12 pb-4 pt-8 w-96">
                <h2 className='flex justify-center mb-8'>
                    Iniciar sesión
                </h2>
                <form action={action}>
                    <div className="w-full">
                        <div>
                            <AuthenticationFormLabel text="Email" label="email"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                placeholder=""
                                type="email"
                                id="email"
                                name="email"
                                defaultValue=''
                                required
                                onInput={handleEmailInput}
                                onInvalid={handleEmailInput}
                            />
                        </div>
                        <div>
                            <AuthenticationFormLabel text="Contraseña" label="password"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                placeholder=""
                                type="password"
                                id="password"
                                name="password"
                                required
                                defaultValue=''
                                onInput={handlePasswordInput}
                                onInvalid={handlePasswordInput}
                            />
                        </div>
                    </div>
                    {(state && state.error == "invalid auth") ? 
                        <div className="flex items-center text-red-600 h-10 px-2">Usuario o contraseña incorrectos.</div>
                        :
                        <div className="h-10"></div>
                    }
                    
                    <LoginButton/>
                </form>
            </div>
        </div>
    )
}
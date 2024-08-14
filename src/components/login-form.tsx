'use client'

import { useFormState } from "react-dom";
import { authenticate} from '@/actions/auth';
import { LoginButton } from "./login-button";
import { AuthenticationFormLabel } from "./signup-form";
import { useRouter } from "next/navigation";
import { validSubscription } from "./utils";

export default function LoginForm() {
    const [state, action] = useFormState(authenticate, undefined)
    const router = useRouter()

    if(state && !state.error){
        if(validSubscription(state.user)){
            router.push("/inicio")
        } else {
            router.push("/suscripciones")
        }
    }

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
            <form action={action}>
                <div className="flex-1 rounded-lg bg-[var(--secondary-light)] px-6 pb-4 pt-8">
                    <h3 className='flex justify-center mb-3'>
                        Iniciar sesión
                    </h3>
                    <div className="w-full pb-4">
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
                    {state && state.error == "invalid auth" && <div className={"mb-1 mt-3 text-red-600"}>Usuario o contraseña incorrectos.</div>}
                    <LoginButton/>
                </div>
            </form>
        </div>
    )
}
'use client'

import { useFormState } from "react-dom";
import {authenticate} from '@/actions/auth';
import {LoginButton} from "./login-button";
import { AuthenticationFormLabel } from "../app/signup/signup-form";
import { useRouter } from "next/navigation";
import { useUser } from "./user-provider";

export default function LoginForm() {
    const [success, action] = useFormState(authenticate, true)
    const {user, setUser} = useUser();
    const router = useRouter()

    const handleEmailInput = (e) => {
        const email = e.target;
        email.setCustomValidity('');
        if (!email.validity.valid) {
            email.setCustomValidity('Ingresá un correo electrónico válido.');
        }
    };

    const handlePasswordInput = (e) => {
        const email = e.target;
        email.setCustomValidity('');
        if (!email.validity.valid) {
            email.setCustomValidity('Ingresá una contraseña.');
        }
    };

    if(success){
        setUser(success)
        router.push("/inicio")
    }

    return (
        <div className="">
            <form action={action}>
                <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                    <h1 className='mb-3 text-2xl'>
                        Iniciá sesión
                    </h1>
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
                    {!success && <div className={"mb-1 mt-3 text-red-600"}>Usuario o contraseña incorrectos.</div>}
                    <LoginButton/>
                </div>
            </form>
        </div>
    )
}
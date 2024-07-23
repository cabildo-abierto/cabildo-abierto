'use client'

import {signup} from "@/actions/auth";
import { useFormState } from "react-dom";
import {DisabledSignupButton, SignupButton} from "./signup-button";
import { useRouter } from "next/navigation";

export const AuthenticationFormLabel: React.FC<{text: string, label: string}> = ({text, label}) => {
    return <label
        className="mt-2 block text-s font-medium text-gray-900"
        htmlFor={label}
    > 
        {text}
    </label>
}

export default function SignupForm() {
    const [state, action] = useFormState(signup, undefined)
    const router = useRouter()

    if(state == "success"){
        router.push("/")
    }

    return (
        <div className="">
            <form action={action}>
                <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                    <h1 className='mb-3 text-2xl editor-container'>
                        Creá tu cuenta
                    </h1>
                    <div className="w-full mb-3">
                        <div>
                            <AuthenticationFormLabel text="Email" label="email"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                placeholder=""
                                type="email"
                                id="email"
                                name="email"
                                defaultValue=''
                            />
                            {
                                state?.errors?.email
                                && <div className="text-sm text-red-500">
                                    {state?.errors?.email.join(', ')}
                                </div>
                            }
                        </div>
                        <div>
                            <AuthenticationFormLabel text="Contraseña" label="password"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                placeholder=""
                                type="password"
                                id="password"
                                name="password"
                                defaultValue=''
                            />
                            {
                                state?.errors?.password
                                && <div className="text-sm text-red-500">
                                    {state?.errors?.password.join(', ')}
                                </div>
                            }
                        </div>
                        <div>
                            <AuthenticationFormLabel text="Tu nombre" label="name"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                placeholder=""
                                type="text"
                                id="name"
                                name="name"
                                defaultValue=''
                            />
                        </div>
                        {
                            state?.errors?.name
                            && <div className="text-sm text-red-500">
                                {state?.errors?.name.join(', ')}
                            </div>
                        }
                        <div>
                            <AuthenticationFormLabel text="Tu nombre de usuario" label="username"/>
                            <div className="flex items-center">
                            <span className="text-gray-600 px-1 text-sm">@</span>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                type="text"
                                id="username"
                                name="username"
                                placeholder=""
                            />
                            </div>
                        </div>
                        {
                            state?.errors?.username
                            && <div className="text-sm text-red-500">
                                {state?.errors?.username.join(', ')}
                            </div>
                        }
                    </div>

                    <SignupButton/>
                </div>
            </form>
        </div>
    )
}
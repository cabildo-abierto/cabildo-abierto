'use client'

import React, { useState } from 'react';
import { signup } from "@/actions/auth";
import { useFormState } from "react-dom";
import { DisabledSignupButton, SignupButton } from "./signup-button";
import { useRouter } from "next/navigation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const AuthenticationFormLabel: React.FC<{text: string, label: string}> = ({text, label}) => {
    return <label
        className="mt-2 block text-s font-medium text-gray-900"
        htmlFor={label}
    > 
        {text}
    </label>
}

const FormErrors: React.FC<any> = ({errors}) => {
    return <div className="flex flex-col text-sm text-red-500 px-1">
        {errors.map((error: string, index: number) => {
            return <div key={index}>
                {error}
            </div>
        })}
    </div>
}

export default function SignupForm() {
    const [state, action] = useFormState(signup, undefined);
    const [showPassword, setShowPassword] = useState(false); // Add state for password visibility
    const router = useRouter();

    if(state && !state.errors){
        router.push("/");
    }

    return (
        <div className="">
            <form action={action}>
                <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                    <h1 className='mb-3 text-2xl ck-content'>
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
                                && <FormErrors errors={state?.errors?.email}/>
                            }
                        </div>
                        <div>
                            <AuthenticationFormLabel text="Contraseña" label="password"/>
                            <div className="relative">
                                <input
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                    placeholder=""
                                    type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                    id="password"
                                    name="password"
                                    defaultValue=''
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                                >
                                    {showPassword ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
                                </button>
                            </div>
                            {
                                state?.errors?.password
                                && <FormErrors errors={state?.errors?.password}/>
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
                                <FormErrors errors={state?.errors?.name}/>
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
                            && <FormErrors errors={state?.errors?.username}/>
                        }
                        <div>
                            <AuthenticationFormLabel text="Clave del período de prueba" label="betakey"/>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                type="text"
                                id="betakey"
                                name="betakey"
                                placeholder=""
                            />
                        </div>
                        {
                            state?.errors?.betakey
                            && <FormErrors errors={state?.errors?.betakey}/>
                        }
                    </div>

                    <SignupButton/>
                </div>
            </form>
        </div>
    )
}

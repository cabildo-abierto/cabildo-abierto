'use client'

import {signup} from "@/actions/auth";
import { useFormState } from "react-dom";
import {SignupButton} from "@/app/signup-button";
import {useState} from "react";

export default function SignupForm() {
    const [state, action] = useFormState(signup, undefined)

    return (
        <div className="space-y-3 items-center">
            <form action={action}>
                <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                    <h1 className='mb-3 text-2xl'>
                        Creá tu cuenta
                    </h1>
                    <div className="w-full mb-3">
                        <div>
                            <label
                                className="mb-1 mt-5 block text-s font-medium text-gray-900"
                                htmlFor="email"
                            >
                                Email
                            </label>
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
                            <label
                                className="mb-2 mt-3 block text-s font-medium text-gray-900"
                                htmlFor="password"
                            >
                                Contraseña
                            </label>
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
                            <label
                                className="mb-2 mt-3 block text-s font-medium text-gray-900"
                                htmlFor="name"
                            >
                                Tu nombre
                            </label>
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
                            <label
                                className="mb-2 mt-3 block text-s font-medium text-gray-900"
                                htmlFor="username"
                            >
                                Nombre de usuario (sin espacios y en minuscula)
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                type="text"
                                id="username"
                                name="username"
                                placeholder=""
                            />
                        </div>
                        {
                            state?.errors?.name
                            && <div className="text-sm text-red-500">
                                {state?.errors?.name.join(', ')}
                            </div>
                        }
                    </div>

                    <SignupButton/>
                </div>
            </form>
        </div>
    )
}
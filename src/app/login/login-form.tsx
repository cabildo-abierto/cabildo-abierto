'use client'

import { useFormState } from "react-dom";
import {authenticate, signup} from '@/actions/auth';
import LoginButton from "./login-button";
import { redirect, useSearchParams } from "next/navigation";
import {SignupButton} from "@/app/signup-button";

export default function LoginForm() {
    const [success, action] = useFormState(authenticate, true)

    console.log("Success", success)

    return (
        <div className="space-y-3 items-center">
            <form action={action}>
                <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                    <h1 className='mb-3 text-2xl'>
                        Creá tu cuenta
                    </h1>
                    <div className="w-full pb-4">
                        <div>
                            <label
                                className="mb-3 mt-5 block text-s font-medium text-gray-900"
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
                        </div>
                        <div>
                            <label
                                className="mb-3 mt-5 block text-s font-medium text-gray-900"
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
                        </div>
                    </div>
                    {!success && <div className={"mb-1 mt-3 text-red-600"}>Usuario o contraseña incorrectos.</div>}
                    <LoginButton/>
                </div>
            </form>
        </div>
    )
}
'use client'

import { useFormState } from "react-dom";
import { authenticate } from '@/actions/auth';
import LoginButton from "./login-button";
import { redirect, useSearchParams } from "next/navigation";

export default function LoginForm({onNoAccount}) {
    const [formState, action] = useFormState(authenticate, undefined);

    if (formState?.startsWith('EMAIL_NOT_VERIFIED')) {
        redirect(`/email/verify/send?email=${formState.split(':')[1]}`)
    }

    return (
        <div className="space-y-3 items-center">
            <form action={action}>
                <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                    <h1 className='mb-3 text-2xl'>
                        Ingresá
                    </h1>
                    <div className="w-full mb-4">
                        <div>
                            <label
                                className="mb-3 mt-5 block text-s font-medium text-gray-900"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                                id="email"
                                type="email"
                                name="email"
                                placeholder=""
                                required
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
                                id="password"
                                type="password"
                                name="password"
                                placeholder=""
                                required
                                minLength={6}
                            />
                        </div>
                        {formState && (
                            <div className="text-sm text-red-500">
                                {formState}
                            </div>
                        )}
                    </div>
                    <LoginButton />
                    <div className='mt-4 text-center'>
                        No tenés una cuenta? <button className='underline' onClick={onNoAccount}>Registrate</button>
                    </div>
                </div>
            </form>
        </div>
    )
}
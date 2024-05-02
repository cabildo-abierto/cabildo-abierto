'use client'

import { useFormStatus } from "react-dom"

export default function SignupButton() {
    const { pending } = useFormStatus();

    return (
        <button className="bg-gray-200 py-2 rounded w-full disabled:bg-slate-50 disabled:text-slate-500 transition duration-300 ease-in-out transform hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50" disabled={pending}>
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
    );
}
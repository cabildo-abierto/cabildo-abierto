'use client'

import { useFormStatus } from 'react-dom'


export function LoginButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="gray-btn w-full">
            <div className="py-1 w-full">
            {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </div>
        </button>
    )
}
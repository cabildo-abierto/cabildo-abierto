'use client'

import { useFormStatus } from 'react-dom'


export function SignupButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="gray-btn w-full">
            <div className="py-1 w-full">
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </div>
        </button>
    )
}
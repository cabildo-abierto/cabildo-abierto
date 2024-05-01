'use client'

import { findUserByEmail, verifyEmail } from "@/actions/auth"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyEmail() {
    const searchParams = useSearchParams()

    const email = searchParams.get('email')
    const token = searchParams.get('token')

    const [isLoading, setIsLoading] = useState(true)
    const [result, setResult] = useState('Ups.. Hubo un error verificando tu mail.')

    useEffect(() => {
        const emailVerification = async () => {
            try {
                if (!email || !token) {
                    throw new Error('Missing required fields');
                }

                const user = await findUserByEmail(email);
                if (!user) {
                    throw new Error('Invalid verification token');
                }

                if (token !== user.emailVerifToken) {
                    throw new Error('Invalid verification token');
                }

                // Update user verification status in database
                await verifyEmail(user.email)

                setResult('Correo verificado! Ya podés iniciar sesión.')
                setIsLoading(false)
            } catch (error) {
                console.error('Error verifying email:', error);
            }
        }

        emailVerification()
    }, [email, token])

    return (
        <>
            <div className='mb-4'>{isLoading ? 'Esperanos un momento...' : result}</div>
            <div className='my-3'>
                <Link href='/login' className='bg-white py-3 px-2 rounded'>Ir al inicio de sesión</Link>
            </div>
        </>
    )
}
'use client'

import { useFormState } from "react-dom";
import ResendButton from "./resend-button";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/actions/auth";

export default function Form() {
    const searchParams = useSearchParams()

    const email = searchParams.get('email')
    const verificationSent = Boolean(searchParams.get('verification_sent'))

    const [formState, action] = useFormState(resendVerificationEmail.bind(null, email!), undefined);

    return (
        <>
            {!!formState && (
                <div className="text-blue-500 mb-4">{formState}</div>
            )}
            {!!verificationSent && (
                <div className="text-blue-800 text-lg mb-4">Mandamos un link de verificación a tu casilla de mail. Por favor, revisá tu casilla.</div>
            )}
            <div>
                <form action={action}>
                    <ResendButton />
                </form>
            </div>
        </>
    )
}
"use client"
import { useFormState, useFormStatus } from "react-dom";
import { AuthForm, EmailInput, PasswordInput } from "../../components/signup-form";
import { ThreeColumnsLayout } from "../../components/three-columns";
import { recoverPw } from "../../actions/auth";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/user";
import LoadingSpinner from "../../components/loading-spinner";
import { useRouter } from "next/navigation";

function RecoverPwButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="gray-btn w-full">
            <div className="py-1 w-full">
            {pending ? 'Enviando...' : 'Enviar mail de recuperación'}
            </div>
        </button>
    )
}



export default function Recover({searchParams}: {searchParams: {token_hash: string, type: string}}){
    const [state, action] = useFormState(recoverPw, undefined);
    const [showingOk, setShowingOk] = useState(false)
    const user = useUser()
    const router = useRouter()

    useEffect(() => {
        if(state && !state.errors){
            setShowingOk(true)
        }
    }, [state])

    if(user.isLoading){
        return <LoadingSpinner/>
    }

    if(user.user){
        router.push("/recuperar/nueva")
    }

    let center = <div className="mt-32 flex flex-col items-center">
            <AuthForm action={action} state={state} title="Recuperar contraseña">
                <EmailInput state={state} label="Ingresá el mail con el que te registraste"/>
                <RecoverPwButton/>
            </AuthForm>
            {showingOk && <div className="text-center">Se envió un mail de recuperación a tu casilla.</div>}
        </div>

    return <ThreeColumnsLayout center={center}/>
}
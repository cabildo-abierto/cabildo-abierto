"use client"
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom"
import { useUser } from "../../hooks/user";
import LoadingSpinner from "../../../components/loading-spinner";
import { useRouter } from "next/navigation";
import { AuthForm, PasswordInput } from "../../../components/signup-form";
import { ThreeColumnsLayout } from "../../../components/three-columns";
import { updatePw } from "../../../actions/auth";
import Link from "next/link";


function NewPwButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="gray-btn w-full">
            <div className="py-1 w-full">
            {pending ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
            </div>
        </button>
    )
}


const PasswordChangeSuccessful = () => {
    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
            
            <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                <div className="py-4 text-lg">Se cambió la contraseña correctamente.</div>
                <div className="flex justify-center items-center py-8 space-x-4">
                    <Link href="/inicio" className="gray-btn">
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};



export default function NewPassword(){
    async function initialAction(state, formData){
        return await updatePw(state, formData)
    }

    const [state, action] = useFormState(initialAction, undefined);
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

    if(!user.user){
        router.push("/recuperar")
    }

    let center = <div className="mt-32 flex flex-col items-center">
        {showingOk && <PasswordChangeSuccessful/>}
        <AuthForm action={action} state={state} title="Nueva contraseña">
            <PasswordInput state={state} label="Ingresá una nueva contraseña"/>
            {(state && state.errors == "same_password") && <div className="text-red-600 text-center">La nueva contraseña no puede ser igual a la anterior.</div>}
            <NewPwButton/>
        </AuthForm>
    </div>

    return <ThreeColumnsLayout center={center}/>
}
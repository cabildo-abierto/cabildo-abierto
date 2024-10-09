'use client'

import React, { ReactNode, useEffect, useState } from 'react';
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ConstructionIcon from '@mui/icons-material/Construction';
import InfoPanel from './info-panel';
import { signup, SignUpFormState } from '../actions/auth';
import ResendEmailButton from './resend-email-button';
import Link from 'next/link';

export const AuthenticationFormLabel: React.FC<{text: string, label: string}> = ({text, label}) => {
    return <label
        className=""
        htmlFor={label}
    > 
        {text}
    </label>
}

const FormErrors: React.FC<any> = ({errors}) => {
    return <div className="flex flex-col text-sm text-red-500 px-1">
        {errors.map((error: string, index: number) => {
            return <div key={index}>
                {error}
            </div>
        })}
    </div>
}


function SignupButton() {
    const {pending} = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit" className="gray-btn w-full">
            <div className="py-1 w-full">
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </div>
        </button>
    )
}

const inputClassName = "custom-input"

function selectErrors(state: any){
    if(!state){
        return state
    }
    if(!state.errors){
        return state
    }
    if(state.errors.email){
        return {errors: {email: state.errors.email}}
    }
    if(state.errors.password){
        return {errors: {password: state.errors.password}}
    }
    if(state.errors.username){
        return {errors: {username: state.errors.username}}
    }
    if(state.errors.name){
        return {errors: {name: state.errors.name}}
    }
    if(state.errors.betakey){
        return {errors: {betakey: state.errors.betakey}}
    }
    return state
}

export const EmailInput = ({state, label="Email"}) => {
    state = selectErrors(state)

    const handleEmailInput = (e: any) => {
        const email = e.target;
        email.setCustomValidity('');
        if (!email.validity.valid) {
            email.setCustomValidity('Ingresá un correo electrónico válido.');
        }
    };

    return <div>
        <AuthenticationFormLabel text={label} label="email"/>
        <input
            className={inputClassName}
            placeholder=""
            type="email"
            id="email"
            name="email"
            defaultValue=''
            onInput={handleEmailInput}
            onInvalid={handleEmailInput}
        />
        {
            state?.errors?.email
            && <FormErrors errors={state?.errors?.email}/>
        }
        {   state?.authError == "user_already_exists"
            && <FormErrors errors={["Ya existe una cuenta con ese mail."]}/>    
        }
    </div>
}

export const PasswordInput = ({state, label="Contraseña"}: {state: SignUpFormState, label?: string}) => {
    state = selectErrors(state)
    const [showPassword, setShowPassword] = useState(false);

    return <div>
        <AuthenticationFormLabel text={label} label="password"/>
        <div className="relative">
            <input
                className={inputClassName}
                placeholder=""
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                defaultValue=''
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
            >
                {showPassword ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
            </button>
        </div>
        {
            state?.errors?.password
            && <FormErrors errors={state?.errors?.password}/>
        }
    </div>
}

const UsernameInput = ({state}) => {
    state = selectErrors(state)
    return <div>
        <div className="flex items-center justify-between">
        <AuthenticationFormLabel text="Nombre de usuario" label="username"/>
        
        <InfoPanel 
            text="Un nombre de usuario único. Solo letras y números, sin espacios. Lo podés cambiar más adelante."
            className="w-64"
        />
        </div>
        <div className="flex items-center">
        <span className="text-gray-600 px-1 text-sm">@</span>
        <input
            className={inputClassName}
            type="text"
            id="username"
            name="username"
            placeholder=""
        />
        </div>
        {
            state?.errors?.username
            && <FormErrors errors={state?.errors?.username}/>
        }
    </div>
}

const NameInput = ({state}: {state: SignUpFormState}) => {
    state = selectErrors(state)
    return <div>
        <div className="flex items-center justify-between">
            <AuthenticationFormLabel text="Nombre" label="name"/>
            <InfoPanel 
                text="El nombre con el que te van a ver otros usuarios, puede tener espacios. Lo podés cambiar más adelante."
                className="w-64"
            />
        </div>
        <input
            className={inputClassName}
            placeholder=""
            type="text"
            id="name"
            name="name"
            defaultValue=''
        />
        {
            state?.errors?.name
            && <div className="text-sm text-red-500">
                <FormErrors errors={state?.errors?.name}/>
            </div>
        }
    </div>
}


export const AuthForm = ({children, action, state, title}: {children: ReactNode, action: any, state: any, title: string}) => {

    return <form action={action} className="flex justify-center items-center lg:w-90 min-w-80">
        <div className="flex-1 bg-[var(--secondary-light)] p-3 border">
            <h2 className='flex justify-center mb-2'>
                {title}
            </h2>
            <div className="w-full space-y-2">
                {children}
            </div>
        </div>
    </form>
}


const ConfirmLinkSentPopup = ({onClose, email}: {onClose: any, email: string}) => {
    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
            
            <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                <div className="mt-4 text-lg">¡Gracias por registrarte!</div>
                <div className="mb-4 text-lg">En breve debería llegarte un mail de confirmación.</div>
                <ResendEmailButton email={email} initializeSent={true}/>
                <div className="flex justify-center items-center py-8 space-x-4">
                    <button onClick={onClose} className="gray-btn">
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function SignupForm() {
    const [state, action] = useFormState(signup, undefined);
    const [showingSignupOK, setShowingSignupOK] = useState(false)

    useEffect(() => {
        if(state && !state.errors){
            setShowingSignupOK(true)
        }
    }, [state])

    return (
        <>
            {showingSignupOK && <ConfirmLinkSentPopup
                onClose={() => {setShowingSignupOK(false)}}
                email={state?.data?.email}
            />}
            <AuthForm action={action} state={state} title="Crear cuenta">
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                <UsernameInput state={state}/>
                <NameInput state={state}/>
                <SignupButton/>
                <div className="text-sm leading-tight mt-1 text-justify text-[var(--text-light)]">
                    Al crear una cuenta aceptás nuestros <Link href="/articulo/Cabildo_Abierto%3A_Términos_y_condiciones" className="link3">Términos y condiciones</Link> y <Link href="/articulo/Cabildo_Abierto%3A_Política_de_privacidad" className="link3">
                    Política de privacidad.
                </Link> ¡Leelos!
                </div>
            </AuthForm>
        </>
    )
}

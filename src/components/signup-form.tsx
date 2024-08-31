'use client'

import React, { ReactNode, useState } from 'react';
import { signup, SignUpFormState } from "src/actions/auth";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ConstructionIcon from '@mui/icons-material/Construction';
import InfoPanel from './info-panel';

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


export const PeriodoDePrueba = () => {
    return <div className="flex justify-center">
        <div className="px-4">
            <div className="text-[var(--accent-dark)] flex items-center border p-2 rounded-lg">
                <div className="mr-2">
                    <ConstructionIcon fontSize="large" />
                </div>
                <div className="flex justify-center">
                    Cabildo Abierto está en período de prueba.<br/>
                    No te vas a poder registrar sin la clave.
                    <br/>Abrimos pronto :)
                </div>
            </div>
        </div>
    </div>
}

const inputClassName = "peer block w-full rounded-md border py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"

export const EmailInput = ({state}) => {
    const handleEmailInput = (e: any) => {
        const email = e.target;
        email.setCustomValidity('');
        if (!email.validity.valid) {
            email.setCustomValidity('Ingresá un correo electrónico válido.');
        }
    };

    return <div>
        <AuthenticationFormLabel text="Email" label="email"/>
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

export const PasswordInput = ({state}: {state: SignUpFormState}) => {
    const [showPassword, setShowPassword] = useState(false);

    return <div>
        <AuthenticationFormLabel text="Contraseña" label="password"/>
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

const BetaPWInput = ({state}: {state: SignUpFormState}) => {
    return <div>
        <AuthenticationFormLabel text="Clave del período de prueba" label="betakey"/>
        <input
            className={inputClassName}
            type="text"
            id="betakey"
            name="betakey"
            placeholder=""
        />
        {
            state?.errors?.betakey
            && <FormErrors errors={state?.errors?.betakey}/>
        }
    </div>
}


export const AuthForm = ({children, action, state, title}: {children: ReactNode, action: any, state: any, title: string}) => {

    return <form action={action} className="flex justify-center items-center">
        <div className="flex-1 rounded-lg bg-[var(--secondary-light)] mx-3 px-4 pb-4 pt-4 w-90 border">
            <h2 className='flex justify-center mb-4'>
                {title}
            </h2>
            <div className="w-full space-y-2">
                {children}
            </div>
        </div>
    </form>
}

export default function SignupForm() {
    const [state, action] = useFormState(signup, undefined);
    const router = useRouter();

    if(state && !state.errors && !state.authError){
        router.push("/");
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-2 mt-2">
                <PeriodoDePrueba/>
            </div>
            <AuthForm action={action} state={state} title="Crear cuenta">
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                <UsernameInput state={state}/>
                <NameInput state={state}/>
                <BetaPWInput state={state}/>
                <SignupButton/>
            </AuthForm>
        </div>
    )
}

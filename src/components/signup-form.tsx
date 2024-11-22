'use client'

import React, { ReactNode, useEffect, useState } from 'react';
import { useFormState, useFormStatus } from "react-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoPanel from './info-panel';
import { signup, SignUpFormState } from '../actions/auth';
import ResendEmailButton from './resend-email-button';
import { CustomLink as Link } from './custom-link';
import { articleUrl } from './utils';
import { BaseFullscreenPopup } from './base-fullscreen-popup';
import LoadingButton from '@mui/lab/LoadingButton';

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
        <LoadingButton
            loading={pending}
            type="submit"
            variant="contained"
            disableElevation={true}
            sx={{
                textTransform: "none",
                width: "100%"
            }}
        >
            <div className="w-full py-1 title">Crear cuenta</div>
        </LoadingButton>
    )
}

export const inputClassName = "custom-input rounded"

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

export const EmailInput = ({state, label="Email"}: {state: SignUpFormState, label?: string}) => {
    state = selectErrors(state)
    const {pending} = useFormStatus()
    const [email, setEmail] = useState("")

    useEffect(() => {
        if(state && !state.errors){
            setEmail("")
        }
    }, [state])


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
            value={email}
            onChange={(e) => {setEmail(e.target.value)}}
            onInput={handleEmailInput}
            onInvalid={handleEmailInput}
        />
        {
            state?.errors?.email && !pending
            && <FormErrors errors={state?.errors?.email}/>
        }
        {   state?.authError == "user_already_exists" && !pending
            && <FormErrors errors={["Ya existe una cuenta con ese mail."]}/>    
        }
    </div>
}

export const PasswordInput = ({state, label="Contraseña"}: {state: SignUpFormState, label?: string}) => {
    state = selectErrors(state)
    const [showPassword, setShowPassword] = useState(false);
    const {pending} = useFormStatus()
    const [password, setPassword] = useState("")

    useEffect(() => {
        if(state && !state.errors){
            setPassword("")
        }
    }, [state])


    return <div>
        <AuthenticationFormLabel text={label} label="password"/>
        <div className="relative">
            <input
                className={inputClassName}
                placeholder=""
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => {setPassword(e.target.value)}}
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
            !pending && state?.errors?.password
            && <FormErrors errors={state?.errors?.password}/>
        }
    </div>
}

const UsernameInput = ({state}) => {
    state = selectErrors(state)
    const {pending} = useFormStatus()

    const [username, setUsername] = useState("")

    useEffect(() => {
        if(state && !state.errors){
            setUsername("")
        }
    }, [state])


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
            value={username}
            onChange={(e) => {setUsername(e.target.value)}}
        />
        </div>
        {
            !pending && state?.errors?.username
            && <FormErrors errors={state?.errors?.username}/>
        }
    </div>
}

const NameInput = ({state}: {state: SignUpFormState}) => {
    state = selectErrors(state)
    const {pending} = useFormStatus()
    const [name, setName] = useState("")

    useEffect(() => {
        if(state && !state.errors){
            setName("")
        }
    }, [state])

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
            value={name}
            onChange={(e) => {setName(e.target.value)}}
        />
        {
            pending && state?.errors?.name
            && <div className="text-sm text-red-500">
                <FormErrors errors={state?.errors?.name}/>
            </div>
        }
    </div>
}


export const AuthForm = ({children, action, state, title}: {children: ReactNode, action: any, state: any, title: ReactNode}) => {

    return <form action={action} className="flex justify-center items-center lg:w-90 min-w-80 px-1">
        <div className="flex-1 bg-[var(--secondary-light)] p-3 content-container rounded">
            <div className='flex justify-center mb-2'>
                {title}
            </div>
            <div className="w-full space-y-2">
                {children}
            </div>
        </div>
    </form>
}


const ConfirmLinkSentPopup = ({open, onClose, email}: {open: boolean, onClose: any, email: string}) => {
    return (
        <BaseFullscreenPopup open={open}>
            <div className="px-6 pt-6 pb-12">
            <div className="mt-4 text-lg">¡Gracias por registrarte!</div>
            <div className="mb-4 text-lg">En breve debería llegarte un mail de confirmación.</div>
            <ResendEmailButton email={email} initializeSent={true}/>
            <div className="mt-4">Cerrá esta ventana cuando hayas recibido el mail de verificación.</div>
            </div>
        </BaseFullscreenPopup>
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

    const title = <div>
        <h2 className="title">
            Creá tu cuenta
        </h2>
        <div className="text-[var(--text-light)] text-lg text-center">
            Es gratis.
        </div>
    </div>

    return (
        <>
            <ConfirmLinkSentPopup
                open={showingSignupOK}
                onClose={() => {setShowingSignupOK(false)}}
                email={state?.data?.email}
            />
            <AuthForm action={action} state={state} title={title}>
                <EmailInput state={state}/>
                <PasswordInput state={state}/>
                <NameInput state={state}/>
                <div className="pt-4">
                    <SignupButton/>
                </div>
                <div className="text-sm leading-tight mt-1 text-justify text-[var(--text-light)]">
                    Al crear una cuenta aceptás los <Link href={articleUrl("Cabildo_Abierto%3A_Términos_y_condiciones")}
                    className="link2">Términos y condiciones</Link> y la <Link href={articleUrl("Cabildo_Abierto%3A_Política_de_privacidad")} className="link2">
                    Política de privacidad
                </Link>. ¡Leelos!
                </div>
            </AuthForm>
        </>
    )
}

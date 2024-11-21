"use client"
import { useState } from "react"
import { inputClassName } from "./signup-form"
import StateButton from "./state-button"
import { selectUsername } from "../actions/auth"
import { useAuthUser } from "../app/hooks/user"
import { LoadingScreen } from "./loading-screen"
import { useSWRConfig } from "swr"
import { TopbarLogo } from "./logo"
import { CloseSessionButton } from "./sidebar"
import { UsernameFormSchema } from "../app/lib/definitions"


export const emptyChar = <>&nbsp;</>


const UsernameInput = ({username, setUsername}: {username: string, setUsername: (u: string) => void}) => {

    return <div>
        <div className="flex items-center justify-between">
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
            autoComplete="off"
            onChange={(e) => {setUsername(e.target.value)}}
        />
        </div>
    </div>
}


export const SelectUsernamePopup = () => {
    const [username, setUsername] = useState("")
    const {authUser, isLoading} = useAuthUser()
    const [alreadyExists, setAlreadyExists] = useState(false)
    const {mutate} = useSWRConfig()

    async function onConfirm(){
        setAlreadyExists(false)
        const {error} = await selectUsername(username)
        if(error == "El nombre de usuario ya está en uso."){
            setAlreadyExists(true)
            return {}
        }
        await mutate("/api/user")
        await mutate("/api/users")
        return {error}
    }

    if(isLoading){
        return <LoadingScreen/>
    }

    const validatedUsername = UsernameFormSchema.safeParse({
        username: username
    })

    return <div className="w-screen h-screen">
        <div className="topbar-container flex justify-between items-center w-screen pl-2 pr-4">
            <TopbarLogo/>
            <CloseSessionButton/>
        </div>
        <div className="flex justify-center items-center w-full">
        <div className="flex flex-col items-center justify-between">

            <div className="flex flex-col items-center mt-32">
                <h2 className="">¡Bienvenido/a {authUser.name}!</h2>

                <div className="text-[var(--text-light)] text-center text-base sm:text-lg mt-4">
                    <p>Para terminar, elegí un nombre de usuario único.</p>
                    <p className="text-base">Así otros te pueden encontrar más fácilmente.</p>
                </div>
            </div>

            <div className="flex flex-col items-center">
                
                <div className="flex justify-center mt-8">
                <div className="w-64">
                    <UsernameInput username={username} setUsername={(u) => {setUsername(u); setAlreadyExists(false)}}/>
                </div>
                </div>
                {!alreadyExists && validatedUsername.success && <div className="h-12 mt-1">{emptyChar}</div>}
                
                {!alreadyExists && !validatedUsername.success && <div className="h-12 text-[var(--text-light)] mt-1">
                    {validatedUsername.error.flatten().fieldErrors.username[0]}
                </div>}
                {false && <div className="text-[var(--text-light)] h-12 text-center text-sm mt-1">
                    Solo letras y números, sin espacios.
                </div>}
                {alreadyExists && <div className="text-[var(--text-light)] h-12 mt-1">
                    Ese nombre de usuario ya está en uso.
                </div>}
            </div>

            <div className="mb-8 mt-8 flex flex-col items-center">
                <StateButton
                    handleClick={onConfirm}
                    text1="Elegir"
                    textClassName="title px-6 py-1"
                    disabled={!validatedUsername.success}
                />
                <div className="text-gray-400 text-center text-sm mt-2">
                    Lo podés cambiar más adelante.
                </div>
            </div>
        </div>
        </div>
    </div>
}

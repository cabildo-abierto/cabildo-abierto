import { userUrl } from "./utils"

import { useState } from 'react';
import { useRouter } from "next/navigation"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"
import { useUser, useUserFollowSuggestions, useUsers } from "../app/hooks/user";
import { CloseButton } from "./close-button";
import { follow } from "../actions/users";
import StateButton from "./state-button";
import Link from "next/link";
import InfoPanel from "./info-panel";


export const FollowSuggestions = () => {
    let {suggestions} = useUserFollowSuggestions()
    const {user} = useUser()
    const [wasClosed, setWasClosed] = useState(false)

    if(!suggestions || suggestions.length == 0 || !user) return <></>

    suggestions = suggestions.filter((u) => (!user.following.some((f) => (f.id == u.id))))

    return <>{!wasClosed && <div className="border rounded">
        <div className="px-2 flex justify-between">
            <div className="flex flex-col py-4 px-2">
                <h4 className="sm:text-xl text-sm text-gray-800">
                    Personas que quizás quieras seguir
                </h4>
                <div className="sm:text-sm text-xs text-[var(--text-light)]">
                    También podés buscar usuarios en la barra de arriba.
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex items-center">
                <InfoPanel text="Sugeridas en función de si siguen a las mismas personas y de la popularidad de los contenidos que escribieron."/>
                <CloseButton onClose={() => {setWasClosed(true)}}/>
                </div>
            </div>
        </div>
        <div className="px-4 mb-2">
            <SuggestionsSlider suggestions={suggestions}/>
        </div>
    </div>}</>
}


function arrayMax(a: any[]){
    let max = a[0];
    for(let i = 1; i < a.length; i++){
        if(a[i] > max) max = a[i]
    }
    return max
}


export const SuggestionsSlider = ({suggestions}: {suggestions: {id: string, name: string}[]}) => {
    const {user} = useUser()

    const amount = Math.min(Math.floor(window.innerWidth / 160), 4)

    const [options, setOptions] = useState(Array.from({ length: amount }, (_, i) => i))

    async function onFollow(followedUserId: string, index: number){
        const result = await follow(followedUserId, user.id)
        if(result == "already follows" || result)
            onClose(index)
    }

    function onClose(index: number){
        const nextIndex = arrayMax(options)+1
        setOptions([...options.slice(0, index), nextIndex, ...options.slice(index+1)])
    }

    return (
    <div
        className="flex justify-center space-x-2 sm:space-x-3 overflow-x-scroll no-scrollbar"
    >
        {options.map((i, index) => {
            if(i >= suggestions.length) return <></>
            const e = suggestions[i]

            return <div
                className="flex-1 border h-32 rounded text-center"
                key={e.id+index}
            >
                <div className="flex flex-col justify-between h-full">
                <div className="flex justify-end text-[var(--text-light)]">
                    <CloseButton onClose={() => {onClose(index)}}/>
                </div>
                <Link href={userUrl(e.id)} className="flex items-center justify-center text-xs sm:text-sm flex-col px-1">
                    <span>
                        {e.name.slice(0, 32)}{e.name.length > 32 ? "..." : ""}
                    </span>
                    <span className="text-[var(--text-light)] text-xs">
                        @{e.id.slice(0, 32)}{e.id.length > 32 ? "..." : ""}
                    </span>
                </Link>
                <div className="flex justify-center text-sm mt-2 mb-1 px-1">
                    <StateButton
                        className="gray-btn"
                        handleClick={async () => {await onFollow(e.id, index); return true}}
                        text1="Seguir"
                        text2="Siguiendo..."
                    />
                </div>
                </div>
            </div>
        })}
    </div>
    );
}
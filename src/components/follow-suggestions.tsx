import { userUrl } from "./utils"

import { useState } from 'react';
import { useUser, useUserFollowSuggestions } from "../app/hooks/user";
import { CloseButton } from "./close-button";
import { follow, updateClosedFollowSuggestions } from "../actions/users";
import StateButton from "./state-button";
import Link from "next/link";
import InfoPanel from "./info-panel";
import ShareIcon from '@mui/icons-material/Share';
import { SharePopup } from "./share-popup";
import { SmallUserProps } from "../app/lib/definitions";
import { CloseButtonIcon, TipIcon } from "./icons";
import { Button } from "@mui/material";


export const FollowSuggestions = () => {
    let {suggestions, isError} = useUserFollowSuggestions()
    const {user} = useUser()
    const [open, setOpen] = useState(user && (!user.closedFollowSuggestionsAt || new Date().getTime() - new Date(user.closedFollowSuggestionsAt).getTime() >= 24*60*60*1000))

    const [openSharePopup, setOpenSharePopup] = useState(false)

    if(!suggestions || !user || isError) return <></>

    function filter(u: SmallUserProps){
        return u.id != "soporte" && !user.following.some((f) => (f.id == u.id))
    }

    suggestions = suggestions.filter(filter)

    async function onClose(){
        setOpen(false)
        await updateClosedFollowSuggestions(user.id)
    }

    if(!open || suggestions.length == 0){
        return <div className="flex justify-end px-1 mt-1">
            <button className="hover:bg-[var(--secondary-light)] rounded text-[var(--text-light)]" onClick={() => {setOpen(true)}}>
                <div className="p-1 flex space-x-1 items-center text-sm">
                    <TipIcon/>
                    <div className="text-[0.65rem]">Sugerencias</div>
                </div>
            </button>
        </div>
    }

    return <div className="content-container rounded bg-[var(--content)] mt-4">
        <div className="pl-2 flex justify-between">
            <div className="flex flex-col py-4 px-2">
                <h4 className="sm:text-xl text-sm text-gray-800">
                    Personas que quizás quieras seguir
                </h4>
                <div className="sm:text-sm text-xs text-[var(--text-light)]">
                    También podés buscar usuarios en la barra de arriba.
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex items-center mr-1 mt-1">
                    <CloseButton onClose={onClose} size="medium"/>
                </div>
            </div>
        </div>
        <div className="px-4 mb-2">
            <SuggestionsSlider suggestions={suggestions} closePanel={onClose}/>
        </div>
        <div className="flex justify-between items-center px-2 mb-2">
            <InfoPanel text="Por seguidos en común y popularidad de sus publicaciones."/>
            <Button
                size="small"
                onClick={() => {setOpenSharePopup(true)}}
                id="share-button" data-umami-event="share-button"
                endIcon={<ShareIcon/>}
                sx={{textTransform: "none"}}
            >
                Compartir
            </Button>
        </div>
        {openSharePopup && <SharePopup onClose={() => {setOpenSharePopup(false)}}/>}
    </div>
}


function arrayMax(a: any[]){
    let max = a[0];
    for(let i = 1; i < a.length; i++){
        if(a[i] > max) max = a[i]
    }
    return max
}


export const SuggestionsSlider = ({suggestions, closePanel}: {
    suggestions: {id: string, name: string}[]
    closePanel: () => void
}) => {
    const {user} = useUser()

    const amount = Math.min(Math.floor(window.innerWidth / 160), 4)

    const [options, setOptions] = useState(Array.from({ length: amount }, (_, i) => i))

    async function onFollow(followedUserId: string, index: number){
        const {error} = await follow(followedUserId, user.id)
        if(error == "already follows" || !error){
            onClose(index)
            return {}
        }
        else return {error}
    }

    function onClose(index: number){
        const nextIndex = arrayMax(options)+1
        setOptions([...options.slice(0, index), nextIndex, ...options.slice(index+1)])
        if(nextIndex >= suggestions.length){
            closePanel()
        }
    }

    return (
    <div
        className="flex justify-center space-x-2 sm:space-x-3 overflow-x-scroll no-scrollbar"
    >
        {options.map((i, index) => {
            if(i >= suggestions.length) return <div key={i}></div>
            const e = suggestions[i]

            return <div
                className="bg-[var(--secondary-light)] min-w-32 h-32 rounded text-center"
                key={e.id+index}
            >
                <div className="flex flex-col justify-between h-full">
                <div className="flex justify-end mt-1 mx-1">
                <CloseButton onClose={() => {onClose(index)}} size="small"/>
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
                        handleClick={async () => {return await onFollow(e.id, index);}}
                        text1="Seguir"
                        text2="Siguiendo..."
                        size="small"
                        variant="contained"
                        disableElevation={true}
                    />
                </div>
                </div>
            </div>
        })}
    </div>
    );
}
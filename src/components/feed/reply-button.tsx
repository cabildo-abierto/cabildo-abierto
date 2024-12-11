import { Button } from "@mui/material"
import { useUser } from "../../hooks/user"
import Image from 'next/image'
import {ProfilePic} from "./profile-pic";



export const ReplyButton = () => {
    const {bskyProfile} = useUser()
    return <div className="border-b px-4 py-1">
        <button
            className="rounded-full bg-[var(--background-dark)] w-full hover:bg-[var(--accent)] transition duration-200 flex items-center px-4 py-1 space-x-2"
    >
        {bskyProfile && <>
            <ProfilePic bskyProfile={bskyProfile} className={"w-8 h-auto rounded-full"}/>
            <span className="text-[var(--text-light)]">Responder</span>
        </>}
        {!bskyProfile && <div className={"text-[var(--text-light)]"}>Iniciá sesión para responder</div>}
    </button>
    </div>
}
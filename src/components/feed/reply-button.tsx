import { Button } from "@mui/material"
import { useUser } from "../../app/hooks/user"
import Image from 'next/image'



export const ReplyButton = () => {
    const {user} = useUser()
    return <div className="border-b px-4 py-1">
        <button
            className="rounded-full w-full hover:bg-[var(--secondary-light)] transition duration-200 flex items-center px-4 py-1 space-x-2"
    >
        <Image
            src={user.avatar}
            width={100}
            height={100}
            alt={"Foto de perfil de " + user.handle}
            className="w-8 h-auto rounded-full"
        />
        <span className="text-[var(--text-light)]">Responder</span>
    </button>
    </div>
}
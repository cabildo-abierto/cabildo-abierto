import { useUser } from "../../hooks/user"
import {ProfilePic} from "./profile-pic";



export const ReplyButton = ({onClick}: {onClick: () => void}) => {
    const {user} = useUser()
    return <div className="border-b px-4 py-1">
        <button
            onClick={onClick}
            className="rounded-full bg-[var(--background-dark)] w-full hover:bg-[var(--accent)] transition duration-200 flex items-center px-4 py-1 space-x-2"
    >
        {user && <>
            <ProfilePic user={user} className={"w-8 h-auto rounded-full"}/>
            <span className="text-[var(--text-light)]">Responder</span>
        </>}
        {!user && <div className={"text-[var(--text-light)]"}>Iniciá sesión para responder</div>}
    </button>
    </div>
}
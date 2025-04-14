import {ProfilePic} from "./profile-pic";
import {useUser} from "@/hooks/swr";



export const ReplyButton = ({onClick, text="Responder"}: {onClick: () => void, text?: string}) => {
    const {user} = useUser()
    return <div className="border-b px-4 py-1">
        <button
            onClick={onClick}
            className="rounded-full bg-[var(--background-dark3)] w-full hover:bg-[var(--accent)] transition duration-200 flex items-center px-4 py-1 space-x-2"
    >
            {user && <>
                <ProfilePic user={user} className={"w-8 h-auto rounded-full"}/>
                <span className="text-[var(--text-light)]">{text}</span>
            </>}
            {!user && <div className={"text-[var(--text-light)]"}>Iniciá sesión para responder</div>}
        </button>
    </div>
}
import {ProfilePic} from "../profile/profile-pic";
import {useSession} from "@/queries/useSession";


export const ReplyButton = ({onClick, text = "Responder"}: { onClick: () => void, text?: string }) => {
    const {user} = useSession()
    return <div className="px-2 py-1">
        <button
            onClick={onClick}
            className="rounded-full bg-[var(--background-dark2)] w-full h-9 hover:bg-[var(--background-dark3)] transition duration-200 flex items-center px-2 py-1 space-x-2"
        >
            {user && <>
                <ProfilePic user={user} className={"pointer-events-none w-6 h-auto rounded-full"} descriptionOnHover={false}/>
                <span className="text-sm text-[var(--text-light)]">{text}</span>
            </>}
            {!user && <div className={"text-[var(--text-light)]"}>Iniciá sesión para responder y ver las respuestas de otros</div>}
        </button>
    </div>
}
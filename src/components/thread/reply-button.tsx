import { Button } from "../../../modules/ui-utils/src/button";
import {ProfilePic} from "../profile/profile-pic";
import {useSession} from "@/queries/api";


export const ReplyButton = ({onClick, text = "Responder"}: { onClick: () => void, text?: string }) => {
    const {user} = useSession()
    return <div className="border-b px-4 py-1">
        <Button
            color={"background-dark"}
            onClick={onClick}
            sx={{flexDirection: "row", justifyContent: "left"}}
            className="rounded-full bg-[var(--background-dark3)] w-full hover:bg-[var(--accent)] transition duration-200 flex items-center px-4 py-1 space-x-2"
        >
            {user && <>
                <ProfilePic user={user} className={"w-8 h-auto rounded-full"} descriptionOnHover={false}/>
                <span className="text-[var(--text-light)]">{text}</span>
            </>}
            {!user && <div className={"text-[var(--text-light)]"}>Iniciá sesión para responder</div>}
        </Button>
    </div>
}
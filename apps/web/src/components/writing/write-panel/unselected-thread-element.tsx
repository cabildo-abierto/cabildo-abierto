import {ProfilePic} from "@/components/perfil/profile-pic";
import {useSession} from "@/components/auth/use-session";
import {ThreadElementState} from "@/components/writing/write-panel/thread-editor";


export const UnselectedThreadElement = ({threadElementState, onSelect}: {
    threadElementState: ThreadElementState
    onSelect: () => void
}) => {
    const {user} = useSession()
    return <div onClick={onSelect} className={"px-2 flex space-x-2 opacity-50 py-2"}>
        <ProfilePic user={user} className={"rounded-full w-8 h-8"}/>
        <div>
            {threadElementState.text}
        </div>
    </div>
}
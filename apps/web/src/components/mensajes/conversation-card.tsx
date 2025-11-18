import {ChatBskyConvoDefs} from "@atproto/api";
import {useSession} from "@/components/auth/use-session";
import Link from "next/link";
import {chatUrl} from "@/components/utils/react/url";
import {ProfilePic} from "@/components/perfil/profile-pic";


export const ConversationCard = ({view}: { view: ChatBskyConvoDefs.ConvoView }) => {
    const {user} = useSession()
    const other = view.members.filter(x => x.did != user.did)[0]
    return <Link
        className="border-b hover:bg-[var(--background-dark)] p-4 space-x-4 flex cursor-pointer"
        href={chatUrl(view.id)}
    >
        <ProfilePic user={other} className={"rounded-full w-12 h-12"}/>
        <div className={"max-w-[80%]"}>
            <div className={"font-semibold"}>
                {other.displayName ?? `@${other.handle}`}
            </div>
            <div>
                {`@${other.handle}`}
            </div>
            <div>
                {ChatBskyConvoDefs.isMessageView(view.lastMessage) && <div className={"text-sm"}>
                    {view.lastMessage.sender.did == user.did ? "Vos: " : ""}{view.lastMessage.text.slice(0, 80) + (view.lastMessage.text.length > 80 ? "..." : "")}
                </div>}
            </div>
        </div>
    </Link>
}
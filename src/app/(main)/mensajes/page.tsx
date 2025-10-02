"use client"
import {useConversations} from "@/queries/getters/useConversations";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {ProfilePic} from "@/components/profile/profile-pic";
import {chatUrl} from "@/utils/uri";
import Link from "next/link";
import {useSession} from "@/queries/getters/useSession";
import { ChatBskyConvoDefs } from "@atproto/api";


const ConversationCard = ({view}: { view: ChatBskyConvoDefs.ConvoView }) => {
    const {user} = useSession()
    const other = view.members.filter(x => x.did != user.did)[0]
    return <Link
        className={"border-b hover:bg-[var(--background-dark)] p-4 space-x-4 flex cursor-pointer"}
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


const Page = () => {
    const {data, isLoading} = useConversations()

    return <div className={"pb-16"}>
        {isLoading && <div className={"py-8"}>
            <LoadingSpinner/>
        </div>}
        {data && data.map(c => {
            return <div key={c.id}>
                <ConversationCard view={c}/>
            </div>
        })}
        {data && data.length == 0 && <div className={"py-8 text-sm text-[var(--text-light)] text-center"}>
            Sin conversaciones todavía.
        </div>}
    </div>
}


export default Page
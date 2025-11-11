import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {ChatBskyConvoDefs} from "@atproto/api";
import {formatIsoDate} from "@/utils/dates";
import {useSession} from "@/queries/getters/useSession";
import {cn} from "@/lib/utils";


export default function MessageCard({
    isMobile,
    message,
    prevMessage
}: {
    isMobile: boolean
    message: ChatBskyConvoDefs.MessageView,
    prevMessage?: ChatBskyConvoDefs.MessageView
}) {
    const {user} = useSession()
    const isAuthor = message.sender.did == user.did
    const prevOtherAuthor = prevMessage && prevMessage.sender.did != message.sender.did
    const isOptimistic = message.id == "optimistic"
    return (
        <div
            className={
                (isAuthor ? "flex justify-end" : "flex") +
                (prevOtherAuthor ? " pt-8" : " pt-1")
            }
        >
            <div className={
                cn("border border-[var(--accent-dark)] max-w-[80%]", isMobile ? "p-2 " : "p-3", isAuthor ? "bg-[var(--background-dark2)] rounded-t-[16px] rounded-l-[16px]" : "bg-[var(--background-dark)] rounded-t-[16px] rounded-r-[16px]", isOptimistic && "bg-[var(--background-dark3)]")
            }>
                <BskyRichTextContent
                    post={{text: message.text, facets: message.facets}}
                    fontSize={isMobile ? "14px" : "15px"}
                    namespace={message.id}
                />
                <div className={"flex justify-end text-[var(--text-light)] " + (isMobile ? "text-[10px]" : "text-xs")}>
                    {formatIsoDate(message.sentAt, true)}
                </div>
            </div>
        </div>
    )
}
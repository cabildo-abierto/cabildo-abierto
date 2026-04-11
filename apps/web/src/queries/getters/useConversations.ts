import {useAPI} from "@/components/utils/react/queries";
import {ChatBskyConvoDefs} from "@atproto/api";
import {$Typed} from "@atproto/api";
import {GetConversationsOutput} from "@cabildo-abierto/api";


export function useConversations() {
    return useAPI<GetConversationsOutput>("/conversations/list", ["conversations"])
}

export type Conversation = {
    messages: PrivateMessage[]
    conversation: ChatBskyConvoDefs.ConvoView
}

export type PrivateMessage = $Typed<ChatBskyConvoDefs.MessageView> |
    $Typed<ChatBskyConvoDefs.DeletedMessageView> |
    {$type: string}

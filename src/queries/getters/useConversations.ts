import {useAPI} from "@/queries/utils";
import {ChatBskyConvoDefs} from "@atproto/api";
import {$Typed} from "@atproto/api";


export function useConversations() {
    return useAPI<ChatBskyConvoDefs.ConvoView[]>("/conversations/list", ["conversations"])
}

export type Conversation = {
    messages: PrivateMessage[]
    conversation: ChatBskyConvoDefs.ConvoView
}

export type PrivateMessage = $Typed<ChatBskyConvoDefs.MessageView> |
    $Typed<ChatBskyConvoDefs.DeletedMessageView> |
    {$type: string}

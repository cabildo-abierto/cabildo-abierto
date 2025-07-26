import {useAPI} from "@/queries/utils";
import {ConvoView} from "@atproto/api/src/client/types/chat/bsky/convo/defs";
import {$Typed} from "@atproto/api";
import {DeletedMessageView, MessageView} from "@/lex-api/types/chat/bsky/convo/defs";

export function useConversations() {
    return useAPI<ConvoView[]>("/conversations/list", ["conversations"])
}


export type Conversation = {
    messages: PrivateMessage[]
    conversation: ConvoView
}

export type PrivateMessage = ($Typed<MessageView> | $Typed<DeletedMessageView> | {$type: string})

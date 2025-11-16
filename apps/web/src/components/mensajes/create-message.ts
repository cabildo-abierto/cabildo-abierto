import {Conversation} from "@/queries/getters/useConversations";
import {ChatBskyConvoDefs} from "@atproto/api"
import {QueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {$Typed} from "@cabildo-abierto/api";
import {QueryFilters} from "@tanstack/query-core";


export type SendMessageParams = { message: ChatBskyConvoDefs.MessageInput, convoId: string }

export const conversationQueriesFilter = (convoId: string): QueryFilters<readonly unknown[]> => ({
    predicate: query => query.queryKey[0] == "conversation" && query.queryKey[1] == convoId
})

export const conversationsQueriesFilter = (): QueryFilters<readonly unknown[]> => ({
    predicate: query => query.queryKey[0] == "conversations"
})

export function optimisticCreateMessage(qc: QueryClient, msg: SendMessageParams, convoId: string, userDid: string){
    qc.setQueryData(["conversation", convoId], old => {
        if(old){
            const conv = old as Conversation
            return produce(conv, draft => {
                const newMsgView: $Typed<ChatBskyConvoDefs.MessageView> = {
                    $type: "chat.bsky.convo.defs#messageView",
                    id: "optimistic",
                    rev: "?", // no sé qué es esto
                    text: msg.message.text,
                    facets: msg.message.facets,
                    sentAt: new Date().toISOString(),
                    sender: {did: userDid}
                }
                draft.messages.push(newMsgView)
            })
        }
    })
}


export function optimisticMarkRead(qc: QueryClient, convoId: string){
    qc.setQueryData(["conversations"], old => {
        if(old){
            const convs = old as ChatBskyConvoDefs.ConvoView[]
            return produce(convs, draft => {
                const index = draft.findIndex(item => item.id == convoId)
                if(index != -1) {
                    draft[index].unreadCount = 0
                }
            })
        }
    })
}
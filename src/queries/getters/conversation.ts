import {useAPI} from "@/queries/utils";
import {Conversation} from "@/queries/getters/useConversations";


export function useConversation(convoIdOrHandle: string) {
    return useAPI<Conversation>(`/conversation/${convoIdOrHandle}`, ["conversation", convoIdOrHandle])
}
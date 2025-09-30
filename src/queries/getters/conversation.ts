import {useAPI} from "@/queries/utils";
import {Conversation} from "@/queries/getters/useConversations";


export function useConversation(convoId: string) {
    return useAPI<Conversation>(`/conversation/${convoId}`, ["conversation", convoId])
}
import {useAPI} from "@/components/utils/react/queries";
import {Conversation} from "./useConversations";


export function useConversation(convoIdOrHandle: string) {
    return useAPI<Conversation>(`/conversation/${convoIdOrHandle}`, ["conversation", convoIdOrHandle])
}
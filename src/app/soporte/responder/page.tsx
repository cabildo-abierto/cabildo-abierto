import { getConversations } from "../../../actions/user/users"
import { ChatPage, NoConversationsChatPage } from "../../../components/chat/chat-page"

import {supportDid} from "../../../components/utils/auth";


export default async function Page({searchParams}: {searchParams: Promise<{i?: string}>}) {
    const {i} = await searchParams
    let conversations = await getConversations(supportDid)

    if(conversations.length == 0){
        return <NoConversationsChatPage/>
    }
    return <ChatPage
        fromUser={supportDid}
        conversations={conversations}
        initialSelection={i}
    />
}
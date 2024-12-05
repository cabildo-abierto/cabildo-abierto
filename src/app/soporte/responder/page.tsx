import { getConversations } from "../../../actions/users"
import { ChatPage, NoConversationsChatPage } from "../../../components/chat-page"
import { supportDid } from "../../../components/utils"


export default async function Page({searchParams}: {searchParams: {i?: string}}) {
    let conversations = await getConversations(supportDid)

    if(conversations.length == 0){
        return <NoConversationsChatPage/>
    }
    return <ChatPage
        fromUser={supportDid}
        conversations={conversations}
        initialSelection={searchParams.i}
    />
}
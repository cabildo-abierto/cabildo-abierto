import { getConversations } from "../../../actions/users"
import { ChatPage, NoConversationsChatPage } from "../../../components/chat-page"


export default async function Page({searchParams}: {searchParams: {i?: string}}) {
    let conversations = await getConversations("soporte")

    if(conversations.length == 0){
        return <NoConversationsChatPage/>
    }
    return <ChatPage
        fromUser="soporte"
        conversations={conversations}
        initialSelection={searchParams.i}
    />
}
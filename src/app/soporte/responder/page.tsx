import { getConversations } from "../../../actions/users"
import { ChatPage, NoConversationsChatPage } from "../../../components/chat-page"


export default async function Page() {
    let conversations = await getConversations("soporte")

    if(conversations.length == 0){
        return <NoConversationsChatPage/>
    }
    return <ChatPage fromUser="soporte" conversations={conversations}/>
}
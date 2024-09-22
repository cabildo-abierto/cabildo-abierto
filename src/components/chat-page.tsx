"use client"

import { useState } from "react"
import { ChatSelector, ConversationStateProps } from "./chat-selector"
import { Chatbox } from "./chatbox"
import { ThreeColumnsLayout } from "./three-columns"

export const NoConversationsChatPage = () => {
    return <div className="text-center mt-16">
        Todavía no tenés conversaciones. Seguí a alguien para empezar una conversación.
    </div>
}


export const ChatPage = ({fromUser, conversations}: {fromUser?: string, conversations: ConversationStateProps[]}) => {
    const [selected, setSelected] = useState(conversations[0].id)

    const center = <div className="text-center">
        <div className="flex justify-center mt-16">
            <Chatbox fromUser={fromUser} toUser={selected}/>
        </div>
    </div>

    const left = <div className="mt-16 flex justify-end">
        <ChatSelector users={conversations} selected={selected} setSelected={setSelected}/>
    </div>

    return <ThreeColumnsLayout center={center} left={left}/>
}
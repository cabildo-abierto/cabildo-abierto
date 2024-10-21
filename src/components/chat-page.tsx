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


export const ChatPage = ({fromUser, conversations, initialSelection}: {fromUser?: string, conversations: ConversationStateProps[], initialSelection?: string}) => {
    const [selected, setSelected] = useState(initialSelection ? initialSelection : conversations[0].id)

    const center = <div className="flex flex-col items-center">
        <div className="mt-16">
            <ChatSelector users={conversations} selected={selected} setSelected={setSelected}/>
        </div>
        
        <div className="text-center mt-16">
        <h3 className="mb-4">Chat con {selected}</h3>
        <div className="flex justify-center">
            <Chatbox fromUser={fromUser} toUser={selected}/>
        </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}
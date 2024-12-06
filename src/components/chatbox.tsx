"use client"

import { useEffect, useRef, useState } from "react"
import { useChat, useUser } from "../app/hooks/user"
import { sendMessage, setMessageSeen } from "../actions/users"
import { DateSince } from "./date"
import StateButton from "./state-button"
import LoadingSpinner from "./loading-spinner"
import { ChatMessage } from "@prisma/client"
import { useSWRConfig } from "swr"
import { SendIcon } from "./icons/send-icon"



const ChatMessageComponent = ({fromUser, message}: {fromUser: string, message: ChatMessage}) => {

    const isFrom = message.fromUserId == fromUser
    const className = "rounded border border-[var(--accent)] px-2 pb-2 pt-1 flex w-5/6 " + (isFrom ? "bg-[var(--secondary-light)]" : "")

    const author = isFrom ? "Vos:" : "@"+message.fromUserId

    useEffect(() => {
        if(!message.seen && message.toUserId == fromUser){
            setMessageSeen(message.id, message.fromUserId, message.toUserId)
        }
    }, [])

    return <div className={"w-full flex " + (isFrom ? "flex justify-end" : "")}><div className={className}>
        <div className="w-full">
            <div className="text-gray-600 text-xs">{author}</div>
            <div>{message.text}</div>
        </div>
        <div className="flex justify-end text-gray-600 w-24 text-xs">
            <DateSince date={message.createdAt}/>
        </div>
    </div>
    </div>
}


export const Chatbox = ({fromUser, toUser}: {fromUser?: string, toUser: string}) => {
    const user = useUser()
    if(!fromUser) fromUser = user.user.did
    const chat = useChat(fromUser, toUser)
    const [message, setMessage] = useState("");
    const endOfMessagesRef = useRef(null);
    const {mutate} = useSWRConfig()

    async function onClickSend(){
        const {error} = await sendMessage(message, fromUser, toUser)
        if(error) return {error}
        setMessage("");
        mutate("/api/chat/"+fromUser+"/"+toUser)
        return {}
    }

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chat.chat]);

    if(chat.isLoading){
        <div className="content-container text-left min-h-[400px] max-w-[500px] space-y-2 flex flex-col items-left justify-between">
            <LoadingSpinner/>
        </div>
    }

    if(!chat.chat){
        return <div className="content-container text-left h-full min-h-[400px] w-full max-w-[500px] space-y-2 flex flex-col items-left justify-between">
            <div className="text-sm text-[var(--text-light)] py-2 px-2">Ningún usuario seleccionado.
            </div>
        </div>
    }

    return (
        <div className="content-container text-left min-h-[400px] h-full w-full max-w-[500px] space-y-2 flex flex-col items-left justify-between">
            {chat.chat.length === 0 && (
                <div className="text-sm text-[var(--text-light)] py-2 px-2">No hay mensajes todavía.</div>
            )}
            <div className="pt-4 px-2 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {chat.chat.map((m, index) => (
                    <div key={index}>
                        <ChatMessageComponent fromUser={fromUser} message={m} />
                    </div>
                ))}
                {/* This is the reference that ensures the scroll goes to the bottom */}
                <div ref={endOfMessagesRef} />
            </div>
            <div className="pb-1 px-2 w-full flex space-x-2">
                <textarea
                    className="bg-[var(--content)] w-full py-1 px-2 resize-none outline-none border border-[var(--accent)]"
                    placeholder="Escribí un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-center items-center">
                    <StateButton
                        disabled={message.length === 0}
                        handleClick={onClickSend}
                        text1={<SendIcon/>}
                        text2={<SendIcon/>}
                        disableElevation={true}
                    />
                </div>
            </div>
        </div>
    );
};

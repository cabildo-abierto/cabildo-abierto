"use client"

import {useParams} from "next/navigation";
import PageHeader from "../../../../../modules/ui-utils/src/page-header";
import {Conversation, PrivateMessage, useConversation, useSession} from "@/queries/api";
import {ConvoView, isMessageView, MessageInput, MessageView} from "@/lex-api/types/chat/bsky/convo/defs";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import {BskyRichTextContent} from "@/components/feed/post/bsky-rich-text-content";
import {formatIsoDate} from "@/utils/dates";
import {useEffect, useState} from "react";
import {TextField} from "../../../../../modules/ui-utils/src/text-field";
import SendIcon from '@mui/icons-material/Send';
import {IconButton} from "../../../../../modules/ui-utils/src/icon-button";
import {post} from "@/utils/fetch";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {$Typed} from "@atproto/api";
import {ErrorPage} from "../../../../../modules/ui-utils/src/error-page";


type SendMessageParams = { message: MessageInput, convoId: string }

const conversationQueriesFilter = (convoId: string) => ({
    predicate: query => query.queryKey[0] == "conversation" && query.queryKey[1] == convoId
})

const conversationsQueriesFilter = () => ({
    predicate: query => query.queryKey[0] == "conversations"
})

function optimisticCreateMessage(qc: QueryClient, msg: SendMessageParams, convoId: string, userDid: string){
    qc.setQueryData(["conversation", convoId], old => {
        if(old){
            const conv = old as Conversation
            return produce(conv, draft => {
                const newMsgView: $Typed<MessageView> = {
                    $type: "chat.bsky.convo.defs#messageView",
                    id: "optimistic",
                    rev: "?", // no sé qué es esto
                    text: msg.message.text,
                    facets: msg.message.facets,
                    sentAt: new Date().toISOString(),
                    sender: {did: userDid}
                }
                draft.messages.push(newMsgView)
            })
        }
    })
}


function optimisticMarkRead(qc: QueryClient, convoId: string){
    qc.setQueryData(["conversations"], old => {
        if(old){
            const convs = old as ConvoView[]
            return produce(convs, draft => {
                const index = draft.findIndex(item => item.id == convoId)
                if(index != -1) {
                    draft[index].unreadCount = 0
                }
            })
        }
    })
}



export default function Page() {
    const params = useParams()
    const convoId = params.id instanceof Array ? params.id[0] : params.id
    const {data, isLoading} = useConversation(convoId)
    const {user} = useSession()
    const [newMessage, setNewMessage] = useState<string>("")
    const qc = useQueryClient()

    const readMutation = useMutation({
        mutationFn: markRead,
        onMutate: (msg) => {
            qc.cancelQueries(conversationsQueriesFilter())
            optimisticMarkRead(qc, convoId)
            setNewMessage("")
        },
        onSettled: async () => {
            qc.invalidateQueries(conversationsQueriesFilter())
        }
    })

    async function markRead(convoId: string) {
        const {error} = await post<{}, {}>(`/conversation/read/${convoId}`)
    }

    useEffect(() => {

        if(data && data.conversation.unreadCount) {
            readMutation.mutate(convoId)
        }
    }, [data])

    const sendMessageMutation = useMutation({
        mutationFn: sendMessage,
        onMutate: (msg) => {
            qc.cancelQueries(conversationQueriesFilter(convoId))
            optimisticCreateMessage(qc, msg, convoId, user.did)
            setNewMessage("")
        },
        onSettled: async () => {
            qc.invalidateQueries(conversationQueriesFilter(convoId))
        },
    })

    if (isLoading) {
        return <LoadingSpinner/>
    } else if(!data){
        return <ErrorPage>
            Ocurrió un error al cargar las conversaciones.
        </ErrorPage>
    }

    function cmp(a: PrivateMessage, b: PrivateMessage) {
        if (isMessageView(a) && isMessageView(b)) {
            return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        }
        return 0
    }

    const messages = data ? data.messages
        .filter(m => isMessageView(m))
        .toSorted(cmp) : null

    async function onSendMessage(){
        const msg: SendMessageParams = {
            message: {
                text: newMessage
            },
            convoId
        }
        sendMessageMutation.mutate(msg)
    }

    async function sendMessage(msg: SendMessageParams) {
        const {error} = await post<SendMessageParams, {}>("/send-message", msg)
    }

    const other = data.conversation ? data.conversation.members.filter(m => m.did != user.did)[0] : undefined

    return (
        <div className="flex flex-col h-screen border-l border-r">
            <PageHeader title={other.displayName ?? "@" + other.handle} defaultBackHref={"/mensajes"}/>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto px-2">
                    <div className="space-y-1 mt-2 pb-2">
                        {messages.map((m, index) => {
                            const isAuthor = m.sender.did == user.did
                            const prevOtherAuthor = index == 0 || messages[index - 1].sender.did != m.sender.did
                            const isOptimistic = m.id == "optimistic"
                            return (
                                <div
                                    key={m.id+":"+index}
                                    className={
                                        (isAuthor ? "flex justify-end" : "flex") +
                                        (prevOtherAuthor ? " pt-8" : "")
                                    }
                                >
                                    <div className={
                                        "rounded-lg p-3 max-w-[80%] " + (isOptimistic ? "bg-[var(--background-dark3)]" : (isAuthor ? "bg-[var(--background-dark)]" : "bg-[var(--background-dark2)]"))
                                    }>
                                        <BskyRichTextContent post={{text: m.text, facets: m.facets}}/>
                                        <div className="flex justify-end text-xs text-[var(--text-light)]">
                                            {formatIsoDate(m.sentAt, true)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="m-2 border rounded-lg flex justify-between items-end bg-[var(--background-dark)]">
                    <TextField
                        value={newMessage}
                        size="small"
                        multiline={true}
                        fullWidth={true}
                        onChange={e => setNewMessage(e.target.value)}
                        minRows={1}
                        maxRows={6}
                        placeholder={"Escribí un mensaje..."}
                        sx={{
                            backgroundColor: "transparent",
                            "& fieldset": {border: "none"},
                            "&:hover fieldset": {border: "none"},
                            "&.Mui-focused fieldset": {border: "none"},
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {border: "none"},
                                "&:hover fieldset": {border: "none"},
                                "&.Mui-focused fieldset": {border: "none"},
                            },
                        }}
                    />
                    <IconButton
                        size={"small"}
                        color={"primary"}
                        sx={{
                            height: "32px",
                            margin: "4px",
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            '& .MuiOutlinedInput-input': {
                                padding: '0px 0px'
                            },
                            '& .MuiFilledInput-input': {
                                paddingTop: '0px',
                                paddingBottom: '0px'
                            },
                            '& .MuiInput-input': {
                                paddingTop: '0px',
                                paddingBottom: '0px'
                            }
                        }}
                        onClick={onSendMessage}
                    >
                        <div className={"px-4 flex justify-center"}>
                            <SendIcon fontSize={"inherit"}/>
                        </div>
                    </IconButton>
                </div>
            </div>
        </div>
    )
}
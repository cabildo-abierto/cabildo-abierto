import {BaseIconButton} from "../layout/base/base-icon-button";
import {useState} from "react";
import {
    conversationQueriesFilter,
    optimisticCreateMessage,
    SendMessageParams
} from "@/components/mensajes/create-message";
import {post} from "@/utils/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSession} from "@/queries/getters/useSession";
import SendIcon from "@/components/layout/icons/send-icon";
import {BaseTextArea} from "@/components/layout/base/base-text-area";


export default function NewMessageInput({
                                            convoId
                                        }: {
    convoId: string
}) {
    const {user} = useSession()
    const [newMessage, setNewMessage] = useState<string>("")
    const qc = useQueryClient()

    async function sendMessage(msg: SendMessageParams) {
        await post<SendMessageParams, {}>("/send-message", msg)
    }

    const sendMessageMutation = useMutation({
        mutationFn: sendMessage,
        onMutate: (msg) => {
            qc.cancelQueries(conversationQueriesFilter(convoId))
            optimisticCreateMessage(qc, msg, convoId, user.did)
            setNewMessage("")
        },
        onSettled: async () => {
            qc.invalidateQueries(conversationQueriesFilter(convoId))
        }
    })

    async function onSendMessage() {
        const msg: SendMessageParams = {
            message: {
                text: newMessage
            },
            convoId
        }
        sendMessageMutation.mutate(msg)
    }

    return <div className={"p-1"}>
        <BaseTextArea
            className={"bg-[var(--background-dark)]"}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            rows={3}
            size={"large"}
            placeholder={"Escribí un mensaje..."}
            endIconClassName={"pl-2 pr-3 pt-1.5"}
            inputGroupClassName={"items-start min-h-[64px]"}
            endIcon={<BaseIconButton
                size={"default"}
                className={"px-3"}
                variant={"outlined"}
                onClick={onSendMessage}
            >
                <SendIcon/>
            </BaseIconButton>}
        />
    </div>
}
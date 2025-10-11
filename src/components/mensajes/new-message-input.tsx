
import {TextField} from "../layout/utils/text-field";
import SendIcon from '@mui/icons-material/Send';
import {IconButton} from "../layout/utils/icon-button";
import {useState} from "react";
import {
    conversationQueriesFilter,
    optimisticCreateMessage,
    SendMessageParams
} from "@/components/mensajes/create-message";
import {post} from "@/utils/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSession} from "@/queries/getters/useSession";


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

    async function onSendMessage(){
        const msg: SendMessageParams = {
            message: {
                text: newMessage
            },
            convoId
        }
        sendMessageMutation.mutate(msg)
    }

    return <div className="m-2 border border-[var(--accent-dark)] flex justify-between items-end bg-[var(--background-dark)]">
        <TextField
            value={newMessage}
            size="small"
            multiline={true}
            fullWidth={true}
            onChange={e => setNewMessage(e.target.value)}
            minRows={1}
            paddingX={"8px"}
            maxRows={6}
            placeholder={"Escribí un mensaje..."}
            borderWidth={0}
            borderColor={"transparent"}
            color="transparent"
            borderWidthNoFocus={0}
        />
        <IconButton
            size={"small"}
            color={"background-dark2"}
            sx={{
                borderRadius: 0,
                border: "1px solid var(--accent-dark)",
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
}
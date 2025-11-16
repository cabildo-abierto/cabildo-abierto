import {CAHandler} from "#/utils/handler.js";
import {
    ConvoView,
    DeletedMessageView,
    MessageInput,
    MessageView
} from "@atproto/api/dist/client/types/chat/bsky/convo/defs.js";
import {$Typed, ChatBskyConvoGetConvoAvailability} from "@atproto/api";
import {handleToDid} from "#/services/user/users.js";


export const getConversations: CAHandler<{}, ConvoView[]> = async (ctx, agent, params) => {
    const chatAgent = agent.bsky.withProxy("bsky_chat", "did:web:api.bsky.chat")

    const {data} = await chatAgent.chat.bsky.convo.listConvos()

    return {data: data.convos}
}

type SendMessageParams = { message: MessageInput, convoId: string }

export const sendMessage: CAHandler<SendMessageParams, {}> = async (ctx, agent, params) => {
    const chatAgent = agent.bsky.withProxy("bsky_chat", "did:web:api.bsky.chat")

    await chatAgent.chat.bsky.convo.sendMessage(params)

    return {data: {}}
}

export type Conversation = {
    messages: ($Typed<MessageView> | $Typed<DeletedMessageView> | { $type: string })[]
    conversation: ConvoView
}

export const getConversation: CAHandler<{
    params: { convoIdOrHandle: string }
}, Conversation> = async (ctx, agent, {params}) => {
    const chatAgent = agent.bsky.withProxy("bsky_chat", "did:web:api.bsky.chat")
    const did = await handleToDid(ctx, agent, params.convoIdOrHandle)

    if (did == null) {
        const convoId = params.convoIdOrHandle
        const [{data}, {data: convData}] = await Promise.all([
            chatAgent.chat.bsky.convo.getMessages({convoId}),
            chatAgent.chat.bsky.convo.getConvo({convoId})
        ])
        return {
            data: {
                messages: data.messages,
                conversation: convData.convo
            }
        }
    } else {
        const convoResponse = await chatAgent.chat.bsky.convo.getConvoForMembers({members: [did]})
        if (!convoResponse.success) {
            return {error: "No se encontró la conversación."}
        }
        const convo = convoResponse.data.convo
        const convoId = convo.id
        const messages = await chatAgent.chat.bsky.convo.getMessages({convoId})
        return {
            data: {
                messages: messages.data.messages,
                conversation: convo
            }
        }
    }

}


export const createConversation: CAHandler<{ params: { did: string } }, {
    convoId: string
}> = async (ctx, agent, {params}) => {
    const {did} = params
    const chatAgent = agent.bsky.withProxy("bsky_chat", "did:web:api.bsky.chat")
    try {
        const convoResponse = await chatAgent.chat.bsky.convo.getConvoForMembers({members: [did]})
        return {data: {convoId: convoResponse.data.convo.id}}
    } catch (err) {
        console.log("No se pudo iniciar la conversación")
        console.log(err)
        return {error: "No se pudo iniciar la conversación."}
    }
}


export const markConversationRead: CAHandler<{ params: { convoId: string } }, {}> = async (ctx, agent, {params}) => {
    const chatAgent = agent.bsky.withProxy("bsky_chat", "did:web:api.bsky.chat")

    await chatAgent.chat.bsky.convo.updateRead({convoId: params.convoId})

    return {data: {}}
}


export const getChatAvailability: CAHandler<{
    params: { handle: string }
}, ChatBskyConvoGetConvoAvailability.Response["data"]> = async (ctx, agent, {params}) => {

    const chatAgent = agent.bsky
        .withProxy("bsky_chat", "did:web:api.bsky.chat")

    const did = await ctx.resolver.resolveHandleToDid(params.handle)

    if(!did) {
        return {error: "No se encontró el usuario"}
    }

    const res = await chatAgent.chat.bsky.convo.getConvoAvailability({
        members: [did]
    })

    return {
        data: res.success ? res.data : undefined,
        error: !res.success ? "Ocurrió un error al obtener la conversación." : undefined
    }
}
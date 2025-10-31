"use client"

import {useParams} from "next/navigation";
import {PrivateMessage} from "@/queries/getters/useConversations";
import {ChatBskyConvoDefs} from "@atproto/api"
import LoadingSpinner from "../../../../components/layout/base/loading-spinner";
import {useEffect, useLayoutEffect, useRef} from "react";
import {post} from "@/utils/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ErrorPage} from "@/components/layout/utils/error-page";
import {
    conversationsQueriesFilter,
    optimisticMarkRead
} from "@/components/mensajes/create-message";
import dynamic from "next/dynamic";
import NewMessageInput from "@/components/mensajes/new-message-input";
import {useConversation} from "@/queries/getters/conversation";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {cn} from "@/lib/utils";


const MessageCard = dynamic(() => import('@/components/mensajes/message-card'), {
    ssr: false,
    loading: () => <div className={"h-[300px]"}/>,
});


export default function Page() {
    const params = useParams()
    const convoIdOrHandle = params.id instanceof Array ? params.id[0] : params.id
    const {data, isLoading} = useConversation(convoIdOrHandle)
    const qc = useQueryClient()
    const {isMobile} = useLayoutConfig()
    const scrollRef = useRef<HTMLDivElement>(null)

    const readMutation = useMutation({
        mutationFn: markRead,
        onMutate: (msg) => {
            qc.cancelQueries(conversationsQueriesFilter())
            optimisticMarkRead(qc, convoIdOrHandle)
        },
        onSettled: async () => {
            qc.invalidateQueries(conversationsQueriesFilter())
        }
    })

    async function markRead(convoId: string) {
        await post<{}, {}>(`/conversation/read/${convoId}`)
    }

    useEffect(() => {
        if(data && data.conversation.unreadCount) {
            readMutation.mutate(data.conversation.id)
        }
    }, [data])

    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [data]);

    if (isLoading) {
        return <LoadingSpinner/>
    } else if(!data){
        return <ErrorPage>
            Ocurrió un error al cargar las conversaciones.
        </ErrorPage>
    }

    function cmp(a: PrivateMessage, b: PrivateMessage) {
        if (ChatBskyConvoDefs.isMessageView(a) && ChatBskyConvoDefs.isMessageView(b)) {
            return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        }
        return 0
    }

    const messages = data ? data.messages
        .filter(m => ChatBskyConvoDefs.isMessageView(m))
        .toSorted(cmp) : null

    return (
        <div
            onWheel={(e) => e.stopPropagation()}
            className={cn("flex flex-col border-l border-r border-[var(--accent-dark)]", isMobile ? "h-[calc(100vh-100px)]" : "h-[calc(100vh-48px)]")}
        >
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto px-2" ref={scrollRef}>
                    <div className="mt-2 pb-2">
                        {messages.map((m, index) => {
                            return <div
                                key={m.id+":"+index}
                            >
                                <MessageCard
                                    isMobile={isMobile}
                                    message={m}
                                    prevMessage={index > 0 ? messages[index-1] : undefined}
                                />
                            </div>
                        })}
                    </div>
                </div>
                <NewMessageInput convoId={data.conversation.id}/>
            </div>
        </div>
    )
}
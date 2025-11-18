"use client"
import {useConversations} from "@/queries/getters/useConversations";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ErrorPage} from "@/components/utils/error-page";
import dynamic from "next/dynamic";

const ConversationCard = dynamic(() => import("@/components/mensajes/conversation-card").then(mod => mod.ConversationCard), {ssr: false})

const Page = () => {
    const {data, isLoading} = useConversations()

    if(isLoading) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    } else if(!data) {
        return <ErrorPage>
            No pudimos obtener las conversaciones.
        </ErrorPage>
    }

    return <div className={"pb-16"}>
        {data.map(c => {
            return <div key={c.id}>
                <ConversationCard view={c}/>
            </div>
        })}
        {data.length == 0 && <div className={"py-8 text-sm text-[var(--text-light)] text-center"}>
            Sin conversaciones todavía.
        </div>}
    </div>
}


export default Page
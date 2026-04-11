"use client"
import {useConversations} from "@/queries/getters/useConversations";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ErrorPage} from "@/components/utils/error-page";
import dynamic from "next/dynamic";
import {BaseButton} from "@/components/utils/base/base-button";
import {AtPermissionsModal} from "@/components/mensajes/at-permissions-modal";

const ConversationCard = dynamic(() => import("@/components/mensajes/conversation-card").then(mod => mod.ConversationCard), {ssr: false})

const Page = () => {
    const {data, isLoading} = useConversations()

    if(isLoading) {
        return <div className={"py-32"}>
            <LoadingSpinner/>
        </div>
    } else if(!data) {
        return <ErrorPage>
            No pudimos obtener las conversaciones.
        </ErrorPage>
    } else if(!data.authorized) {
        return <div className={"flex flex-col items-center"}>
            <div className={"text-sm text-[var(--text-light)] p-8"}>
                Los mensajes privados funcionan con tu cuenta de la Atmosfera. Para usarlos desde acá, le tenés que dar acceso a Cabildo Abierto.
            </div>
            <div>
                <AtPermissionsModal>
                    <BaseButton variant={"outlined"} size={"small"} type={"button"}>
                        Configurar permisos
                    </BaseButton>
                </AtPermissionsModal>
            </div>
        </div>
    }

    return <div className={"pb-16"}>
        {data.conversations.map(c => {
            return <div key={c.id}>
                <ConversationCard view={c}/>
            </div>
        })}
        {data.conversations.length == 0 && <div className={"py-8 text-sm text-[var(--text-light)] text-center"}>
            Sin conversaciones todavía.
        </div>}
    </div>
}


export default Page
import MessagesIcon from "@/components/layout/icons/messages-icon";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";
import Link from "next/link";
import {useAPI} from "@/queries/utils";
import {ChatBskyConvoGetConvoAvailability} from "@atproto/api"
import DescriptionOnHover from "@/components/layout/utils/description-on-hover";
import {useSession} from "@/queries/getters/useSession";


function useChatAvailability(handle: string) {
    return useAPI<ChatBskyConvoGetConvoAvailability.Response["data"]>(`/chat-availability/${handle}`, ["chat-availability", handle])
}


export function MessageButton({
                                  handle
                              }: {
    handle: string
}) {
    const {user} = useSession()
    const {
        data: chatAvailability,
        isLoading: loadingChatAvailability
    } = useChatAvailability(handle)

    const disabled = loadingChatAvailability || !chatAvailability || !chatAvailability.canChat

    if(!user) {
        return null
    }

    return <div className="flex items-center">
        {disabled &&
            <DescriptionOnHover
                description={chatAvailability && !chatAvailability.canChat && `@${handle} no acepta mensajes directos.`}>
                <BaseIconButton
                    disabled={true}
                    size="small"
                    variant="outlined"
                >
                    <MessagesIcon weight='light'/>
                </BaseIconButton>
            </DescriptionOnHover>
        }
        {!disabled &&
            <Link href={`/mensajes/${handle}`}>
                <BaseIconButton
                    disabled={false}
                    size="small"
                    variant="outlined"
                >
                    <MessagesIcon weight='light'/>
                </BaseIconButton>
            </Link>
        }
    </div>
}
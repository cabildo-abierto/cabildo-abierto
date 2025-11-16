import {useConversations} from "@/queries/getters/useConversations";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {BaseButton} from "@/components/utils/base/base-button";
import {useState} from "react";
import {BaseFullscreenPopup} from "../utils/dialogs/base-fullscreen-popup";
import {CloseButton} from "@/components/utils/base/close-button";
import {SearchBar} from "@/components/utils/base/search-bar";
import UserSearchResults from "../buscar/user-search-results";
import {useRouter} from "next/navigation";
import {post} from "@/components/utils/react/fetch";
import {chatUrl} from "@/components/utils/react/url";


const CreateConvPanel = ({open, onClose}: { open: boolean, onClose: () => void }) => {
    const [searchValue, setSearchValue] = useState("")
    const [creatingConv, setCreatingConv] = useState(false)
    const {data: conversations} = useConversations()
    const router = useRouter()
    const [creationError, setCreationError] = useState<string | null>(null)

    async function onClickResult(did: string) {
        const idx = conversations.findIndex(c => c.members.some(m => m.did == did))
        if (idx != -1) {
            router.push(chatUrl(conversations[idx].id))
        } else {
            setCreatingConv(true)
            const {error, data} = await post<{}, { convoId: string }>(`/conversation/create/${did}`)
            if (!error) {
                if (data) {
                    router.push(chatUrl(data.convoId))
                }
            } else {
                if (error == "recipient requires incoming messages to come from someone they follow") {
                    setCreationError("El usuario elegido solo recibe mensajes de usuarios que sigue.")
                } else {
                    setCreationError(error)
                }
                setCreatingConv(false)
            }
        }
    }

    return <BaseFullscreenPopup
        className="z-[1500]"
        open={open}
        backgroundShadow={false} // TO DO: Si ponemos true por algún motivo la sidebar queda arriba
    >
        <div className={"min-[500px]:w-[500px]"}>
            <div className={"flex justify-between items-center px-2"}>
                <div className={"p-2 uppercase font-semibold"}>
                    Iniciar una conversación
                </div>
                <CloseButton onClose={onClose} size={"small"}/>
            </div>
            <div className={"h-[500px]"}>
                {!creatingConv && !creationError && <div>
                    <div className={"py-2 px-4 h-[60px]"}>
                        <SearchBar
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className={"h-[440px] overflow-y-scroll custom-scrollbar"}>
                        <UserSearchResults
                            searchState={{searching: true, value: searchValue}}
                            maxCount={20}
                            onClickResult={onClickResult}
                            showSearchButton={false}
                            showFollowButton={false}
                            splitBluesky={false}
                            goToProfile={false}
                        />
                    </div>
                </div>}
                {creatingConv && <div className={"flex items-center justify-center h-full"}>
                    <LoadingSpinner/>
                </div>}
                {creationError && <div className={"flex flex-col items-center justify-center h-full space-y-4"}>
                    <div className={"text-center"}>
                        {creationError}
                    </div>
                    <BaseButton size={"small"} onClick={() => {
                        setCreationError(null)
                    }}>
                        <span className={"font-semibold text-sm"}>Aceptar</span>
                    </BaseButton>
                </div>}
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default CreateConvPanel;
"use client"
import PageHeader from "../../../../modules/ui-utils/src/page-header";
import {useConversations} from "@/queries/useConversations";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {ProfilePic} from "@/components/profile/profile-pic";
import {chatUrl} from "@/utils/uri";
import Link from "next/link";
import {Button} from "../../../../modules/ui-utils/src/button";
import AddIcon from "@mui/icons-material/Add";
import {useState} from "react";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import SearchBar from "@/components/buscar/search-bar";
import UserSearchResults from "@/components/buscar/user-search-results";
import {post} from "@/utils/fetch";
import {useRouter} from "next/navigation";
import {useSession} from "@/queries/useSession";
import { ChatBskyConvoDefs } from "@atproto/api";


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

    return <BaseFullscreenPopup open={open} backgroundShadow={true}>
        <div className={"min-[500px]:w-[500px]"}>
            <div className={"flex justify-between items-center px-2"}>
                <h3 className={"p-2"}>
                    Iniciar una conversación
                </h3>
                <CloseButton onClose={onClose} size={"small"}/>
            </div>
            <div className={"h-[500px]"}>
                {!creatingConv && !creationError && <div>
                    <div className={"p-2 h-[60px]"}>
                        <SearchBar
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            color={"background-dark2"}
                        />
                    </div>
                    <div className={"h-[440px] overflow-y-scroll no-scrollbar"}>
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
                    <Button size={"small"} onClick={() => {
                        setCreationError(null)
                    }}>
                        <span className={"font-semibold text-sm"}>Aceptar</span>
                    </Button>
                </div>}
            </div>
        </div>
    </BaseFullscreenPopup>
}


const ConversationCard = ({view}: { view: ChatBskyConvoDefs.ConvoView }) => {
    const {user} = useSession()
    const other = view.members.filter(x => x.did != user.did)[0]
    return <Link
        className={"border-b hover:bg-[var(--background-dark)] p-4 space-x-4 flex cursor-pointer"}
        href={chatUrl(view.id)}
    >
        <ProfilePic user={other} className={"rounded-full w-16 h-16"}/>
        <div className={"max-w-[80%]"}>
            <div className={"font-semibold"}>
                {other.displayName ?? `@${other.handle}`}
            </div>
            <div>
                {`@${other.handle}`}
            </div>
            <div>
                {ChatBskyConvoDefs.isMessageView(view.lastMessage) && <div className={"text-sm"}>
                    {view.lastMessage.sender.did == user.did ? "Vos: " : ""}{view.lastMessage.text.slice(0, 80) + (view.lastMessage.text.length > 80 ? "..." : "")}
                </div>}
            </div>
        </div>
    </Link>
}


const Page = () => {
    const {data, isLoading} = useConversations()
    const [creatingConv, setCreatingConv] = useState<boolean>(false)

    const newConversationButton = <Button startIcon={<AddIcon/>} size={"small"} onClick={() => {
        setCreatingConv(true)
    }}>
        <span className={"text-xs py-1 font-semibold"}>Nueva conversación</span>
    </Button>

    return <div>
        <PageHeader title={"Mensajes"} rightSide={newConversationButton}/>
        {isLoading && <div className={"py-8"}>
            <LoadingSpinner/>
        </div>}
        {data && data.map(c => {
            return <div key={c.id}>
                <ConversationCard view={c}/>
            </div>
        })}
        {data && data.length == 0 && <div className={"py-8 text-sm text-[var(--text-light)] text-center"}>
            Sin conversaciones todavía.
        </div>}
        {creatingConv && <CreateConvPanel open={creatingConv} onClose={() => {
            setCreatingConv(false)
        }}/>}
    </div>
}


export default Page
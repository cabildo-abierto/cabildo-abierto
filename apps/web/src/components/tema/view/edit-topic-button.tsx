import {BaseButton} from "@/components/utils/base/base-button"
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {topicUrl} from "@/components/utils/react/url";
import {useTopicPageParams} from "../use-topic-page-params";
import {useRouter} from "next/navigation";
import {useSession} from "@/components/auth/use-session";
import {useLoginModal} from "@/components/auth/login-modal-provider";


export const EditTopicButton = () => {
    const router = useRouter()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    const {did, rkey, topicId} = useTopicPageParams()
    return <BaseButton
        startIcon={<WriteButtonIcon/>}
        variant={"outlined"}
        className={"[&_svg]:size-4"}
        onClick={() => {
            if(user) {
                router.push(topicUrl(topicId, {did, rkey}, true))
            } else {
                setLoginModalOpen(true)
            }
        }}
    >
        Editar
    </BaseButton>
}
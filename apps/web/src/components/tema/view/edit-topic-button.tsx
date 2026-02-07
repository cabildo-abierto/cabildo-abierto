import {BaseButton} from "@/components/utils/base/base-button"
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {topicUrl} from "@/components/utils/react/url";
import {useRouter} from "next/navigation";
import {useSession} from "@/components/auth/use-session";
import {useLoginModal} from "@/components/auth/login-modal-provider";


export const EditTopicButton = ({topicId}: {topicId: string}) => {
    const router = useRouter()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    return <BaseButton
        startIcon={<WriteButtonIcon/>}
        variant={"outlined"}
        className={"[&_svg]:size-4"}
        onClick={() => {
            if(user) {
                router.push(topicUrl(topicId, null, true))
            } else {
                setLoginModalOpen(true)
            }
        }}
    >
        Editar
    </BaseButton>
}
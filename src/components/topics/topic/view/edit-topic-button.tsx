import { BaseButton } from "@/components/layout/base/baseButton"
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {topicUrl} from "@/utils/uri";
import {useTopicPageParams} from "@/components/topics/topic/use-topic-page-params";
import {useRouter} from "next/navigation";



export const EditTopicButton = () => {
    const router = useRouter()
    const {did, rkey, topicId} = useTopicPageParams()
    return <BaseButton
        startIcon={<WriteButtonIcon/>}
        variant={"outlined"}
        className={"[&_svg]:size-4"}
        onClick={() => {router.push(topicUrl(topicId, {did, rkey}, "editing"))}}
    >
        Editar
    </BaseButton>
}
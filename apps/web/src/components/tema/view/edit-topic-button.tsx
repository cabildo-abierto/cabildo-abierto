import {BaseButton} from "@/components/utils/base/base-button"
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {topicUrl} from "@/components/utils/react/url";
import {useTopicPageParams} from "../use-topic-page-params";
import {useRouter} from "next/navigation";


export const EditTopicButton = () => {
    const router = useRouter()
    const {did, rkey, topicId} = useTopicPageParams()
    return <BaseButton
        startIcon={<WriteButtonIcon/>}
        variant={"outlined"}
        className={"[&_svg]:size-4"}
        onClick={() => {
            router.push(topicUrl(topicId, {did, rkey}, true))
        }}
    >
        Editar
    </BaseButton>
}
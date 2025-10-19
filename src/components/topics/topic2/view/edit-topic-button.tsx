import { Button } from "@/components/layout/utils/button"
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {topicUrl} from "@/utils/uri";
import {useTopicPageParams} from "@/components/topics/topic/topic-page";
import {useRouter} from "next/navigation";



export const EditTopicButton = () => {
    const router = useRouter()
    const {did, rkey, topicId} = useTopicPageParams()
    return <div className={"absolute top-14 right-7 z-[200]"}>
        <Button
            startIcon={<WriteButtonIcon/>}
            variant={"outlined"}
            size={"small"}
            onClick={() => {router.push(topicUrl(topicId, {did, rkey}, "editing"))}}>
            Editar
        </Button>
    </div>
}
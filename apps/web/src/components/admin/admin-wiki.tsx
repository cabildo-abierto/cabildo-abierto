import {useState} from "react"
import {BaseTextField} from "@/components/utils/base/base-text-field"
import {BaseButton} from "@/components/utils/base/base-button"
import {post} from "@/components/utils/react/fetch";


export const AdminWiki = () => {
    const [topicId, setTopicId] = useState("")

    async function onUpdateMentions() {
        const {error} = await post("/job/update-topic-mentions", {jobData: [topicId]})
        return {error}
    }

    async function onUpdateContributions() {
        const {error} = await post("/job/update-topic-contributions", {jobData: [topicId]})
        return {error}
    }

    return <div className={"flex flex-col space-y-4 items-center mt-8"}>
        <BaseTextField
            label={"Id del tema"}
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
        />

        <BaseButton onClick={onUpdateMentions} variant={"outlined"} size={"small"}>
            Actualizar popularidad
        </BaseButton>

        <BaseButton onClick={onUpdateContributions} variant={"outlined"} size={"small"}>
            Actualizar contribuciones
        </BaseButton>

    </div>

}
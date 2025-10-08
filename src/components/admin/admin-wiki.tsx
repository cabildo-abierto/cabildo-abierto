import { useState } from "react"
import { TextField } from "../../../modules/ui-utils/src/text-field"
import { Button } from "../../../modules/ui-utils/src/button"
import {post} from "@/utils/fetch";



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
        <TextField
            size={"small"}
            label={"Id del tema"}
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
        />

        <Button onClick={onUpdateMentions} variant={"outlined"} size={"small"}>
            Actualizar popularidad
        </Button>

        <Button onClick={onUpdateContributions} variant={"outlined"} size={"small"}>
            Actualizar contribuciones
        </Button>

    </div>

}
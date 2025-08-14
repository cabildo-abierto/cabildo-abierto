import { IconButton } from "../../../../modules/ui-utils/src/icon-button";
import { ModalOnClick } from "../../../../modules/ui-utils/src/modal-on-click"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";
import {ArrowsClockwiseIcon} from "@phosphor-icons/react";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {post} from "@/utils/fetch";



export const TopicOptionsButton = ({topic}: {topic: TopicView}) => {

    async function onUpdateMentions() {
        const {error} = await post("/job/update-topic-mentions", {id: topic.id})
        return {error}
    }

    async function onUpdateContributions() {
        const {error} = await post("/job/update-topic-contributions", {topicIds: [topic.id]})
        return {error}
    }


    const modal = (onClose: () => void) => (
        <div className="text-base border rounded bg-[var(--background-dark)] p-1 z-[3000]">
            <OptionsDropdownButton
                text1={"Actualizar menciones"}
                startIcon={<ArrowsClockwiseIcon/>}
                handleClick={onUpdateMentions}
            />
            <OptionsDropdownButton
                text1={"Actualizar contribuciones"}
                startIcon={<ArrowsClockwiseIcon/>}
                handleClick={onUpdateContributions}
            />
        </div>
    )

    return <ModalOnClick modal={modal}>
        <div className={"text-[var(--text-light)] text-xs"}>
            <IconButton
                color="background"
                size={"small"}
            >
                <MoreHorizIcon fontSize="inherit"/>
            </IconButton>
        </div>
    </ModalOnClick>
}
import {ModalOnClick} from "../../../modules/ui-utils/src/modal-on-click";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import SwapVertIcon from '@mui/icons-material/SwapVert';
import dynamic from "next/dynamic";
const TopicSortSelectorModal = dynamic(() => import("@/components/topics/topic-sort-selector-modal"))

export type TopicsSortOrder = "Populares" | "Ediciones recientes"


const TopicsSortSelector = ({sortedBy, setSortedBy}: {
    sortedBy: TopicsSortOrder
    setSortedBy: (s: TopicsSortOrder) => void
}) => {
    const modal = (onClose: () => void) =>
        <TopicSortSelectorModal
            setSortedBy={setSortedBy}
            sortedBy={sortedBy}
            onClose={onClose}
        />

    return <ModalOnClick modal={modal}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                size={"small"}
                color={"background"}
            >
                <SwapVertIcon fontSize={"small"}/>
            </IconButton>
        </div>
    </ModalOnClick>
}


export default TopicsSortSelector;
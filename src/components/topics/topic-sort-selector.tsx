import {ModalOnClick} from "../../../modules/ui-utils/src/modal-on-click";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import SwapVertIcon from '@mui/icons-material/SwapVert';
import dynamic from "next/dynamic";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
const TopicSortSelectorModal = dynamic(() => import("@/components/topics/topic-sort-selector-modal"))

export type TopicsSortOrder = "Populares" | "Ediciones recientes"


const TopicsSortSelector = ({sortedBy, setSortedBy, disabled}: {
    sortedBy: TopicsSortOrder
    setSortedBy: (s: TopicsSortOrder) => void
    disabled: boolean
}) => {
    const modal = (onClose: () => void) =>
        <TopicSortSelectorModal
            setSortedBy={setSortedBy}
            sortedBy={sortedBy}
            onClose={onClose}
        />

    return <DescriptionOnHover description={"Ordenar"}>
        <ModalOnClick modal={modal}>
            <div className={"text-[var(--text-light)]"}>
                <IconButton
                    disabled={disabled}
                    size={"small"}
                    color={"background"}
                >
                    <SwapVertIcon fontSize={"small"}/>
                </IconButton>
            </div>
        </ModalOnClick>
    </DescriptionOnHover>
}


export default TopicsSortSelector;
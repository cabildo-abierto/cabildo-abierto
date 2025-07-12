import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import SwapVertIcon from '@mui/icons-material/SwapVert';
import dynamic from "next/dynamic";
import {ClickableModalOnClick} from "../../../modules/ui-utils/src/popover";
const TopicSortSelectorModal = dynamic(() => import("@/components/topics/topic-sort-selector-modal"))

export type TopicsSortOrder = "Populares última semana" | "Populares último día" | "Populares último mes" | "Ediciones recientes"


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

    return <ClickableModalOnClick modal={modal} description={"Ordenar"} id="topics-sort-selector">
        <div className={"text-[var(--text-light)]"} id="topics-sort-selector">
            <IconButton
                disabled={disabled}
                size={"small"}
                color={"background"}
            >
                <SwapVertIcon fontSize={"small"}/>
            </IconButton>
        </div>
    </ClickableModalOnClick>
}


export default TopicsSortSelector;
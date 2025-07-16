import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";
import {TopicsSortOrder} from "@/components/topics/topic-sort-selector";

type Props = {
    setSortedBy: (s: TopicsSortOrder) => void
    sortedBy: TopicsSortOrder
    onClose: () => void
}

const TopicSortSelectorModal = ({setSortedBy, sortedBy, onClose}: Props) => {
    return (
        <div className={"p-1 space-y-1 border rounded bg-[var(--background-dark)]"}>
            {["Populares último día", "Populares última semana", "Populares último mes", "Ediciones recientes"].map((s: TopicsSortOrder, index) => {
                return <div key={index}>
                    <OptionsDropdownButton
                        handleClick={async () => {
                            setSortedBy(s)
                            onClose()
                            return {}
                        }}
                        color={"background-dark"}
                        fullWidth={true}
                        size={"small"}
                        text1={<span className={s == sortedBy ? "font-bold" : ""}>{s}</span>}
                    />
                </div>
            })}
        </div>
    )
}


export default TopicSortSelectorModal
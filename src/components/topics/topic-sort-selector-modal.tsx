import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import {TTOption} from "@/lib/types";

type Props = {
    setSortedBy: (s: TTOption) => void
    sortedBy: TTOption
    onClose: () => void
}

function ttLabelToOption(label: string): TTOption {
    if(label == "Populares último día"){
        return "Último día"
    } else if(label == "Populares última semana"){
        return "Última semana"
    } else if(label == "Populares último mes"){
        return "Último mes"
    } else if(label == "Ediciones recientes"){
        return "Ediciones recientes"
    } else {
        return "Última semana"
    }
}

const TopicSortSelectorModal = ({setSortedBy, sortedBy, onClose}: Props) => {
    return (
        <div className={"p-1 space-y-1 border rounded bg-[var(--background)]"}>
            {["Populares último día", "Populares última semana", "Populares último mes", "Ediciones recientes"].map((s, index) => {
                return <div key={index}>
                    <OptionsDropdownButton
                        handleClick={async () => {
                            setSortedBy(ttLabelToOption(s))
                            onClose()
                            return {}
                        }}
                        color={"background"}
                        fullWidth={true}
                        size={"small"}
                        text1={<span className={ttLabelToOption(s) == sortedBy ? "font-bold" : ""}>{s}</span>}
                    />
                </div>
            })}
        </div>
    )
}


export default TopicSortSelectorModal
import {TTOption} from "@/lib/types";
import {ArrowsDownUpIcon} from "@phosphor-icons/react";
import DescriptionOnHover from "@/components/layout/utils/description-on-hover";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";


function ttLabelToOption(label: string): TTOption {
    if (label == "Populares último día") {
        return "Último día"
    } else if (label == "Populares última semana") {
        return "Última semana"
    } else if (label == "Populares último mes") {
        return "Último mes"
    } else if (label == "Ediciones recientes") {
        return "Ediciones recientes"
    } else {
        return "Última semana"
    }
}


const TopicsSortSelector = ({sortedBy, setSortedBy, disabled}: {
    sortedBy: TTOption
    setSortedBy: (s: TTOption) => void
    disabled: boolean
}) => {

    return <DropdownMenu>
        <DropdownMenuTrigger>
            <DescriptionOnHover description="Ordenar">
                <BaseNotIconButton
                    id={"topics-sort-selector"}
                >
                    <ArrowsDownUpIcon fontSize={20}/>
                </BaseNotIconButton>
            </DescriptionOnHover>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={"start"} className={"z-[1002]"}>
            {["Populares último día", "Populares última semana", "Populares último mes", "Ediciones recientes"].map((s, index) => {
                const selected = ttLabelToOption(s) == sortedBy
                return <DropdownMenuItem
                    key={index}
                    onClick={() => {
                        setSortedBy(ttLabelToOption(s))
                    }}
                >
                        <span className={selected ? "font-semibold" : ""}
                        >
                            {s}
                        </span>
                </DropdownMenuItem>
            })}
        </DropdownMenuContent>
    </DropdownMenu>
}


export default TopicsSortSelector;
import {ArrowsDownUpIcon} from "@phosphor-icons/react";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/utils/ui/dropdown-menu"
import {BaseNotIconButton} from "@/components/utils/base/base-not-icon-button";
import {topicsPageSortOptions, TTOption} from "@cabildo-abierto/api";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {useTopicsPageParams} from "@/components/feed/config/topics";
import {Select} from "@/components/utils/ui/select";
import {BaseSelect} from "@/components/utils/base/base-select";
import {PrettyJSON} from "@/components/utils/pretty-json";


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


function ttOptionToLabel(option: TTOption): string {
    if(option == "Ediciones recientes") {
        return option
    } else if(option == "Última semana") {
        return "Populares última semana"
    } else if(option == "Último año") {
        return "Populares último año"
    } else if(option == "Último día") {
        return "Populares último día"
    } else if(option == "Último mes") {
        return "Populares último mes"
    }
}


const TopicsSortSelector = () => {
    const {sortedBy} = useTopicsPageParams()

    function setSortedBy(v: string) {
        updateSearchParam("s", v)
    }

    return <div className={"w-48"}>
        <BaseSelect
            value={sortedBy}
            options={topicsPageSortOptions}
            onChange={setSortedBy}
            optionLabels={ttOptionToLabel}
            size={"small"}
        />
    </div>
}


export default TopicsSortSelector;
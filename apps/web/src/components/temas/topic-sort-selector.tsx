import React from "react";
import {topicsPageSortOptions, TTOption} from "@cabildo-abierto/api";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {useTopicsPageParams} from "@/components/feed/config/topics";
import {BaseSelect} from "@/components/utils/base/base-select";


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
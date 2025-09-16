import {useSession} from "@/queries/useSession";
import {useFollowingParams} from "@/components/inicio/main-page";
import {FeedFormatOption, FollowingFeedFilterOption} from "@/lib/types";
import {updateSearchParam} from "@/utils/fetch";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {configOptionNodes} from "@/components/config/config-option-nodes";


export const FollowingFeedConfig = () => {
    const {user} = useSession()
    const {filter, format} = useFollowingParams(user)

    function setFilter(v: FollowingFeedFilterOption) {
        updateSearchParam("filtro", v)
    }

    function setFormat(v: FeedFormatOption) {
        updateSearchParam("formato", v)
    }

    function onSelection(v: string) {
        if (v == "Todos") {
            setFilter("Todos")
            setFormat("Todos")
        } else if (v == "Cabildo Abierto") {
            setFilter("Solo Cabildo Abierto")
            setFormat("Todos")
        } else if (v == "Artículos") {
            setFilter("Solo Cabildo Abierto")
            setFormat("Artículos")
        }
    }

    const selected = format == "Artículos" ? "Artículos" : (filter == "Solo Cabildo Abierto" ? "Cabildo Abierto" : "Todos")

    return <div className={"space-y-2"}>
        <SelectionComponent
            onSelection={onSelection}
            options={["Todos", "Cabildo Abierto", "Artículos"]}
            optionsNodes={configOptionNodes}
            selected={selected}
            className={"flex gap-x-2 gap-y-1 flex-wrap"}
            optionContainerClassName={""}
        />
    </div>
}
import {useSession} from "@/components/auth/use-session";
import {useFollowingParams} from "../feed/main-page";
import SelectionComponent from "../../buscar/search-selection-component";
import {configOptionNodes} from "./config-option-nodes";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {FeedFormatOption, FollowingFeedFilter} from "@cabildo-abierto/api";


export const FollowingFeedConfig = () => {
    const {user} = useSession()
    const {filter, format} = useFollowingParams(user)

    function setFilter(v: FollowingFeedFilter) {
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
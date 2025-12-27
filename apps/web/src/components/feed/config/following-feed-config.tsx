import SelectionComponent from "../../buscar/search-selection-component";
import {configOptionNodes} from "./config-option-nodes";
import {FeedFormatOption, FollowingFeedFilter} from "@cabildo-abierto/api";
import { Note } from "@/components/utils/base/note";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";


export const FollowingFeedConfig = () => {
    const {config, setConfig, openFeeds} = useMainPageFeeds()

    if(!config || config.type != "main" || config.subtype != "siguiendo"){
        return <Note>
            Ocurrió un error al cargar la configuración.
        </Note>
    }

    const {format, filter} = config

    function setFilterAndFormat(format: FeedFormatOption, filter: FollowingFeedFilter) {
        if(config.subtype == "siguiendo") {
            setConfig(openFeeds.selected, {
                ...config,
                format,
                filter
            })
        }
    }

    function onSelection(v: string) {
        if (v == "Todos") {
            setFilterAndFormat("Todos", "Todos")
        } else if (v == "Cabildo Abierto") {
            setFilterAndFormat("Todos", "Solo Cabildo Abierto")
        } else if (v == "Artículos") {
            setFilterAndFormat("Artículos", "Solo Cabildo Abierto")
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
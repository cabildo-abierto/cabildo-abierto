import SelectionComponent from "../../buscar/search-selection-component"
import {configOptionNodes} from "./config-option-nodes";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime,
    enDiscusionTimeOptions
} from "@cabildo-abierto/api";
import { Note } from "@/components/utils/base/note";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {EnDiscusionMetric, EnDiscusionTime, FeedFormatOption} from "@cabildo-abierto/api";


export const EnDiscusionFeedConfig = () => {
    const {config, setConfig, openFeeds} = useMainPageFeeds()

    if(!config || config.type != "main" || config.subtype != "discusion"){
        return <Note>
            Ocurrió un error al cargar la configuración.
        </Note>
    }

    const {metric, time, format} = config

    function setMetric(v: EnDiscusionMetric) {
        if(config.subtype == "discusion") {
            setConfig(openFeeds.selected, {
                ...config,
                metric: v
            })
        }
    }

    function setTime(v: EnDiscusionTime) {
        if(config.subtype == "discusion") {
            setConfig(openFeeds.selected, {
                ...config,
                time: v
            })
        }
    }

    function setFormat(v: FeedFormatOption) {
        if(config.subtype == "discusion") {
            setConfig(openFeeds.selected, {
                ...config,
                format: v
            })
        }
    }

    return <div className={"space-y-4 w-full"}>
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Métrica
            </div>
            <SelectionComponent
                onSelection={setMetric}
                options={["Interacciones", "Recientes", "Me gustas", "Popularidad relativa"]}
                optionsNodes={configOptionNodes}
                selected={metric ?? defaultEnDiscusionMetric}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
        {metric != "Recientes" && <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Período
            </div>
            <SelectionComponent
                onSelection={setTime}
                options={enDiscusionTimeOptions}
                optionsNodes={configOptionNodes}
                selected={time ?? defaultEnDiscusionTime}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>}
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Formato
            </div>
            <SelectionComponent
                onSelection={setFormat}
                options={["Todos", "Artículos"]}
                optionsNodes={configOptionNodes}
                selected={format ?? defaultEnDiscusionFormat}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
    </div>
}
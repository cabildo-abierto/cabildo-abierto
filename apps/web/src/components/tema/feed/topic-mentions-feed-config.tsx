import SelectionComponent from "../../buscar/search-selection-component";
import {configOptionNodes} from "../../feed/config/config-option-nodes";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {
    defaultTopicMentionsFormat,
    defaultTopicMentionsMetric, defaultTopicMentionsTime,
    EnDiscusionMetric,
    EnDiscusionTime,
    FeedFormatOption
} from "@cabildo-abierto/api";


export const TopicMentionsFeedConfig = () => {
    const {config, setConfig, openFeeds} = useMainPageFeeds()

    if(config.type != "topic" || config.subtype != "mentions") return null

    const {metric, format, time} = config

    function setMetric(v: EnDiscusionMetric) {
        if(config.subtype == "mentions") {
            setConfig(openFeeds.selected, {
                ...config,
                metric: v
            })
        }
    }

    function setTime(v: EnDiscusionTime) {
        if(config.subtype == "mentions") {
            setConfig(openFeeds.selected, {
                ...config,
                time: v
            })
        }
    }

    function setFormat(v: FeedFormatOption) {
        if(config.subtype == "mentions") {
            setConfig(openFeeds.selected, {
                ...config,
                format: v
            })
        }
    }

    return <div className={"space-y-4 pt-2"}>
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Métrica
            </div>
            <SelectionComponent
                onSelection={setMetric}
                options={["Interacciones", "Recientes", "Me gustas", "Popularidad relativa"]}
                optionsNodes={configOptionNodes}
                selected={metric ?? defaultTopicMentionsMetric}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
        {(metric ?? defaultTopicMentionsMetric) != "Recientes" && <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Período
            </div>
            <SelectionComponent
                onSelection={setTime}
                options={["Último día", "Última semana", "Último mes"]}
                optionsNodes={configOptionNodes}
                selected={time ?? defaultTopicMentionsTime}
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
                selected={format ?? defaultTopicMentionsFormat}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
    </div>
}
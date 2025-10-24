import {useSession} from "@/queries/getters/useSession";
import {useUpdateSearchParams} from "@/components/layout/utils/update-search-params";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {configOptionNodes} from "@/components/config/config-option-nodes";
import {useTopicFeedParams} from "@/components/topics/topic/use-topic-feed-params";

export const TopicMentionsFeedConfig = () => {
    const {user} = useSession()
    const {metric, time, format} = useTopicFeedParams(user)
    const {updateSearchParam} = useUpdateSearchParams()

    function setMetric(v: string) {
        updateSearchParam("m", v)
    }

    function setTime(v: string) {
        updateSearchParam("p", v)
    }

    function setFormat(v: string) {
        updateSearchParam("formato", v)
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
                selected={metric}
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
                options={["Último día", "Última semana", "Último mes"]}
                optionsNodes={configOptionNodes}
                selected={time}
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
                selected={format}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
    </div>
}
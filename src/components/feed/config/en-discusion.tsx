import SelectionComponent from "@/components/buscar/search-selection-component"
import {
    useEnDiscusionParams
} from "@/components/inicio/main-page";
import {updateSearchParam} from "@/utils/fetch";
import {useSession} from "@/queries/getters/useSession";
import {configOptionNodes} from "@/components/feed/config/config-option-nodes";
import {enDiscusionTimeOptions} from "@/components/feed/config/defaults";
import {Note} from "@/components/layout/utils/note";


export const EnDiscusionFeedConfig = () => {
    const {user} = useSession()
    const {metric, time, format} = useEnDiscusionParams(user)

    function setMetric(v: string) {
        updateSearchParam("m", v)
    }

    function setTime(v: string) {
        updateSearchParam("p", v)
    }

    function setFormat(v: string) {
        updateSearchParam("formato", v)
    }

    return <div className={"space-y-4"}>
        <Note className={"text-left"}>
            Configurá <span className={"font-medium"}>En discusión</span>
        </Note>
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
                options={enDiscusionTimeOptions}
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
import SelectionComponent from "../../buscar/search-selection-component"
import {
    useEnDiscusionParams
} from "../feed/main-page";
import {useSession} from "@/components/auth/use-session";
import {configOptionNodes} from "./config-option-nodes";
import {enDiscusionTimeOptions} from "./defaults";
import {updateSearchParam} from "@/components/utils/react/search-params";


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
import { Button } from "../../../../modules/ui-utils/src/button"
import {PlotConfigProps} from "@/lib/types";
import {produce} from "immer";
import {FunnelIcon} from "@phosphor-icons/react";


export const TopicsDataSourceConfig = ({config, setConfig, onGoToFilters}: {
    config: PlotConfigProps
    setConfig: (v: PlotConfigProps) => void
    onGoToFilters: () => void
}) => {

    function onClickBack(){
        setConfig(produce(config, draft => {
            draft.dataSource = {
                $type: "ar.cabildoabierto.embed.visualization#datasetDataSource"
            }
        }))
    }

    return <div className={"flex flex-col items-center"}>
        <div className={"text-sm text-[var(--text-light)] text-center py-16 px-4"}>
            Usá <button onClick={onGoToFilters} className={"text-[var(--primary)] hover:underline font-semibold"}>filtros</button> para elegir una lista de temas de la wiki, que van a ser los datos de tu visualización.
        </div>
    </div>
}
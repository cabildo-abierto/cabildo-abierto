import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {PlotConfigProps} from "@/lib/types";
import {
    isHemicycle,
    isDatasetDataSource,
    isTwoAxisPlot,
    isOneAxisPlot
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {produce} from "immer";
import {useDatasets} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";


type PlotSpecificConfigProps = {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}

export const PlotSpecificConfig = ({config, setConfig}: PlotSpecificConfigProps) => {
    const {data: datasets} = useDatasets()
    if(!config.spec || !config.spec.$type) return null

    if(!datasets) return <div>
        <LoadingSpinner/>
    </div>

    const dataSource = config.dataSource
    const dataset = isDatasetDataSource(dataSource) ? datasets.find(d => d.uri == dataSource.dataset) : undefined

    if(isTwoAxisPlot(config.spec)){
        return <div className={"flex flex-col space-y-4"}>
            <SearchableDropdown
                options={dataset ? dataset.columns.map(c => c.name) : []}
                label={"Eje x"}
                size={"small"}
                selected={config.spec.xAxis ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(isTwoAxisPlot(draft.spec)){
                            draft.spec.xAxis = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={dataset ? dataset.columns.map(c => c.name) : []}
                label={"Eje y"}
                size={"small"}
                selected={config.spec.yAxis ??  ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(isTwoAxisPlot(draft.spec)){
                            draft.spec.yAxis = v
                        }
                    }))
                }}
            />
        </div>
    }
    if(isOneAxisPlot(config.spec)) {
        return <div>
            <SearchableDropdown
                options={dataset ? dataset.columns.map(c => c.name) : []}
                label={"Eje x"}
                size={"small"}
                selected={config.spec.xAxis ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(isOneAxisPlot(draft.spec)){
                            draft.spec.xAxis = v
                        }
                    }))
                }}
            />
        </div>
    } else if(isHemicycle(config.spec)){
        return <div>
            Sin implementar
        </div>
    }
}

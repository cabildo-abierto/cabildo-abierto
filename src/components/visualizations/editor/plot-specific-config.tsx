import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown"
import {PlotConfigProps} from "@/lib/types"
import {
    isHemicycle,
    isDatasetDataSource,
    isTwoAxisPlot,
    isOneAxisPlot, isTable, isTopicsDataSource
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {produce} from "immer"
import {useDatasets} from "@/queries/api"
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner"
import {TableVisualizationConfig} from "@/components/visualizations/editor/table-visualization-config"
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor"
import {useMemo} from "react"


type PlotSpecificConfigProps = {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}

export const PlotSpecificConfig = ({config, setConfig}: PlotSpecificConfigProps) => {
    const {data: datasets} = useDatasets()
    const {
        data: topicsDataset
    } = useTopicsDataset(isTopicsDataSource(config.dataSource) ? config.filters : null, true)
    const dataSource = config.dataSource
    const dataset = datasets && isDatasetDataSource(dataSource) ? datasets.find(d => d.uri == dataSource.dataset) : undefined

    const columnOptions = useMemo(() => {
        if(dataset){
            return dataset.columns.map(c => c.name)
        } else if(topicsDataset && topicsDataset.data){
            return topicsDataset.data.columns.map(c => c.name)
        } else {
            return null
        }
    }, [dataset, topicsDataset])

    if(!config.spec || !config.spec.$type) return null

    if(!datasets) return <div>
        <LoadingSpinner/>
    </div>

    if(isTwoAxisPlot(config.spec)){
        return <div className={"flex flex-col space-y-4 w-full"}>
            <SearchableDropdown
                options={columnOptions}
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
                options={columnOptions}
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
                options={columnOptions}
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
    } else if(isTable(config.spec)){
        return <TableVisualizationConfig config={config} setConfig={setConfig}/>
    }
}

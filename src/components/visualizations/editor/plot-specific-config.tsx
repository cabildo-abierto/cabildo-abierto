import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown"
import {PlotConfigProps} from "@/lib/types"
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {produce} from "immer"
import {useDatasets} from "@/queries/getters/useDataset"
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner"
import {TableVisualizationConfig} from "@/components/visualizations/editor/table-visualization-config"
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor"
import {useMemo} from "react"
import {TwoAxisPlotConfig} from "@/components/visualizations/editor/two-axis-plot-config";
import {ElectionVisualizationConfig} from "@/components/visualizations/editor/election/election-visualization-config";


type PlotSpecificConfigProps = {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}

export const PlotSpecificConfig = ({config, setConfig}: PlotSpecificConfigProps) => {
    const {data: datasets} = useDatasets()
    const {
        data: topicsDataset
    } = useTopicsDataset(ArCabildoabiertoEmbedVisualization.isTopicsDataSource(config.dataSource) ? config.filters : null, true)
    const dataSource = config.dataSource
    const dataset = datasets && ArCabildoabiertoEmbedVisualization.isDatasetDataSource(dataSource) ? datasets.find(d => d.uri == dataSource.dataset) : undefined

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

    if(ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(config.spec)){
        return <TwoAxisPlotConfig
            columnOptions={columnOptions}
            config={config}
            setConfig={setConfig}
        />
    }
    if(ArCabildoabiertoEmbedVisualization.isOneAxisPlot(config.spec)) {
        return <div>
            <SearchableDropdown
                options={columnOptions}
                label={"Eje x"}
                size={"small"}
                selected={config.spec.xAxis ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(ArCabildoabiertoEmbedVisualization.isOneAxisPlot(draft.spec)){
                            draft.spec.xAxis = v
                        }
                    }))
                }}
            />
        </div>
    } else if(ArCabildoabiertoEmbedVisualization.isHemicycle(config.spec)){
        return <div>
            Sin implementar
        </div>
    } else if(ArCabildoabiertoEmbedVisualization.isTable(config.spec)){
        return <TableVisualizationConfig
            config={config}
            setConfig={setConfig}
        />
    } else if(ArCabildoabiertoEmbedVisualization.isEleccion(config.spec)) {
        return <ElectionVisualizationConfig
            config={config}
            setConfig={setConfig}
            columnOptions={columnOptions}
        />
    }
}

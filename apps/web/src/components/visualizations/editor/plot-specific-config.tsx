import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {produce} from "immer"
import {useDatasets} from "@/queries/getters/useDataset"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {TableVisualizationConfig} from "./table-visualization-config"
import {useTopicsDataset} from "./visualization-editor"
import {useMemo} from "react"
import {TwoAxisPlotConfig} from "./two-axis-plot-config";
import {ElectionVisualizationConfig} from "./election-visualization-config";

import {PlotConfigProps} from "./types";
import {BaseSelect} from "@/components/utils/base/base-select";
import { Note } from "@/components/utils/base/note";


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
        if (dataset) {
            return dataset.columns.map(c => c.name)
        } else if (topicsDataset && topicsDataset.data) {
            return topicsDataset.data.columns.map(c => c.name)
        } else {
            return null
        }
    }, [dataset, topicsDataset])

    if (!config.spec || !config.spec.$type) return null

    if(columnOptions == null) {
        return <Note>
            Elegí un conjunto de datos primero
        </Note>
    }

    if (!datasets) return <div>
        <LoadingSpinner/>
    </div>

    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(config.spec)) {
        return <TwoAxisPlotConfig
            columnOptions={columnOptions}
            config={config}
            setConfig={setConfig}
        />
    }
    if (ArCabildoabiertoEmbedVisualization.isOneAxisPlot(config.spec)) {
        return <BaseSelect
            contentClassName={"z-[1501]"}
            options={columnOptions}
            label={"Eje x"}
            deselectOption={true}
            value={config.spec.xAxis ?? ""}
            onChange={(v: string) => {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isOneAxisPlot(draft.spec)) {
                        draft.spec.xAxis = v
                    }
                }))
            }}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isHemicycle(config.spec)) {
        return <div>
            Sin implementar
        </div>
    } else if (ArCabildoabiertoEmbedVisualization.isTable(config.spec)) {
        return <TableVisualizationConfig
            config={config}
            setConfig={setConfig}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isEleccion(config.spec)) {
        return <ElectionVisualizationConfig
            config={config}
            setConfig={setConfig}
            columnOptions={columnOptions}
        />
    }
}

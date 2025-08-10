import {PlotConfigProps} from "@/lib/types";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {
    isDatasetDataSource, isTopicsDataSource,
    validateMain as validateVisualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {PlotFromVisualizationMain} from "@/components/visualizations/plot";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {useDataset, useDatasets} from "@/queries/useDataset";
import {
    readyToPlot,
    useTopicsDataset,
    validateColumnFilters
} from "@/components/visualizations/editor/visualization-editor";


function NextStep({config}: { config: PlotConfigProps }) {
    if (!config.dataSource) {
        return "Elegí un conjunto de datos."
    } else if (config.dataSource && isDatasetDataSource(config.dataSource)) {
        if (config.dataSource.dataset) {
            return "Configurá la visualización."
        } else {
            return "Elegí un conjunto de datos."
        }
    } else if (config.dataSource && isTopicsDataSource(config.dataSource)) {
        return "Configurá los filtros y cargá los datos. Después, configurá la visualización."
    }
}


type EditorViewerViewVisualizationProps = {
    config: PlotConfigProps
    onSave: (v: Visualization) => void
}


const EditorViewerViewVisualization = ({
                                           config,
                                           onSave
                                       }: EditorViewerViewVisualizationProps) => {


    const validatedVisualization = validateVisualization(config)
    const visualization = validatedVisualization.success ? validatedVisualization.value : null

    return <div className={"flex flex-col justify-center items-center h-full w-full"}>
        {readyToPlot(config) ?
            <div className={"overflow-x-auto overflow-y-auto"}>
                <PlotFromVisualizationMain
                    visualization={visualization}
                    width={700}
                    height={500}
                />
            </div> :
            <div className={"w-full h-full flex justify-center items-center text-[var(--text-light)]"}>
                <NextStep config={config}/>
            </div>}
    </div>
}


const EditorViewerViewDataForDataset = ({datasetUri, config}: {
    datasetUri: string
    config: PlotConfigProps
}) => {
    const {data: dataset, isLoading} = useDataset(datasetUri)
    const {data: datasets} = useDatasets()

    if (!dataset && !datasets) {
        return <div className={"py-8 h-full flex"}>
            <LoadingSpinner/>
        </div>
    } else if (!dataset && datasets) {
        const filters = config.filters ? validateColumnFilters(config.filters) : undefined
        return <DatasetFullView
            dataset={{
                $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
                ...datasets.find(d => d.uri == datasetUri)
            }}
            filters={filters}
        />
    }

    if (isLoading || !dataset) {
        return <div className={"py-8 h-full flex items-center"}>
            <LoadingSpinner/>
        </div>
    }

    const filters = config.filters ? validateColumnFilters(config.filters) : undefined

    return <DatasetFullView
        dataset={{
            $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
            ...dataset
        }}
        filters={filters}
    />
}


const EditorViewerViewDataForTopicsDataset = ({config}: {config: PlotConfigProps}) => {
    const {data, isLoading} = useTopicsDataset(config.filters)
    if(isLoading) {
        return <div>
            <LoadingSpinner/>
        </div>
    } else if(data && data.data) {
        const filters = config.filters ? validateColumnFilters(config.filters) : undefined
        return <DatasetFullView
            dataset={{
                ...data.data,
                $type: "ar.cabildoabierto.data.dataset#topicsDatasetView"
            }}
            filters={filters}
        />
    } else {
        return <div className={"h-full flex justify-center items-center text-[var(--text-light)]"}>
            <NextStep config={config}/>
        </div>
    }
}


const EditorViewerViewData = ({config}: {
    config: PlotConfigProps
}) => {
    if(config.dataSource && isTopicsDataSource(config.dataSource)) {
        return <EditorViewerViewDataForTopicsDataset config={config}/>
    } else if (config.dataSource && isDatasetDataSource(config.dataSource) && config.dataSource.dataset) {
        return <EditorViewerViewDataForDataset
            datasetUri={config.dataSource.dataset}
            config={config}
        />
    } else {
        return <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
            <NextStep config={config}/>
        </div>
    }
}


export const EditorViewer = ({config, selected, onSave}: {
    config: PlotConfigProps
    selected: string
    onSave: (v: Visualization) => void
}) => {

    return <div className={"h-full w-full pt-12 px-16"}>
        {selected == "Visualización" && <EditorViewerViewVisualization
            config={config}
            onSave={onSave}
        />}
        {selected == "Datos" && <EditorViewerViewData
            config={config}
        />}
    </div>
}
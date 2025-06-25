import {PlotConfigProps} from "@/lib/types";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {emptyChar} from "@/utils/utils";
import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {
    isDatasetDataSource,
    validateMain as validateVisualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {PlotFromVisualizationMain} from "@/components/visualizations/plot";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {Button} from "../../../../modules/ui-utils/src/button";
import {useDataset, useDatasets} from "@/queries/api";
import {readyToPlot} from "@/components/visualizations/editor/visualization-editor";


function nextStep(config: PlotConfigProps) {
    const datasetAvailable = config.dataSource && isDatasetDataSource(config.dataSource) && config.dataSource.dataset

    if (!datasetAvailable) {
        return "Elegí un conjunto de datos."
    } else {
        return "Configurá la visualización"
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
            <div className={"w-full h-full flex justify-center items-center"}>
                {nextStep(config)}
            </div>}
    </div>
}


const EditorViewerViewDataForDataset = ({datasetUri}: { datasetUri: string }) => {
    const {data: dataset, isLoading} = useDataset(datasetUri)
    const {data: datasets} = useDatasets()

    if (!dataset && !datasets) {
        return <div className={"py-8 h-full flex"}>
            <LoadingSpinner/>
        </div>
    } else if (!dataset && datasets) {
        return <DatasetFullView
            dataset={{
                $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
                ...datasets.find(d => d.uri == datasetUri)
            }}
        />
    }

    if (isLoading || !dataset) {
        return <div className={"py-8 h-full flex items-center"}>
            <LoadingSpinner/>
        </div>
    }

    return <DatasetFullView
        dataset={{
            $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
            ...dataset
        }}
    />
}


const EditorViewerViewData = ({config}: {
    config: PlotConfigProps
}) => {

    if (config.dataSource && isDatasetDataSource(config.dataSource)) {
        if (config.dataSource.dataset) {
            return <EditorViewerViewDataForDataset
                datasetUri={config.dataSource.dataset}
            />
        } else {
            return <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
                {nextStep(config)}
            </div>
        }
    } else {
        return <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
            {nextStep(config)}
        </div>
    }

}


export const EditorViewer = ({config, selected, setSelected, onSave}: {
    config: PlotConfigProps
    selected: string
    setSelected: (s: string) => void
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
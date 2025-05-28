import {PlotConfigProps} from "@/lib/types";
import SelectionComponent from "@/components/buscar/search-selection-component";
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


function readyToPlot(config: PlotConfigProps): config is Visualization {
    const res = validateVisualization(config)
    return res.success
}


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
    maxWidth: number
    onSave: (v: Visualization) => void
}


const EditorViewerViewVisualization = ({
                                                  config,
                                                  maxWidth,
                                                  onSave
                                              }: EditorViewerViewVisualizationProps) => {


    const validatedVisualization = validateVisualization(config)
    const visualization = validatedVisualization.success ? validatedVisualization.value : null

    return <div className={"flex flex-col justify-between h-full"}>
        {readyToPlot(config)  ?
            <div style={{maxWidth: maxWidth}} className={"overflow-x-auto overflow-y-auto"}>
                <PlotFromVisualizationMain
                    visualization={visualization}
                />
            </div> :
        nextStep(config)}
        {readyToPlot(config) ?
            <div className={"h-12 pb-4 flex justify-center w-full"}>
                <Button
                    onClick={() => {onSave(config)}}
                >
                    <span className={"font-bold"}>
                        Listo
                    </span>
                </Button>
            </div> :
            <div className={"h-12"}>{emptyChar}</div>
        }
    </div>
}


const EditorViewerViewDataForDataset = ({maxWidth, datasetUri}: {maxWidth?: number | string, datasetUri: string}) => {
    const {data: dataset, isLoading} = useDataset(datasetUri)
    const {data: datasets} = useDatasets()

    if(!dataset && !datasets){
        return <div className={"py-8 h-full flex items-center"}>
            <LoadingSpinner/>
        </div>
    } else if(!dataset && datasets){
        return <div className={"w-full h-full"} style={{maxWidth: maxWidth}}>
            <DatasetFullView dataset={{
                $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
                ...datasets.find(d => d.uri == datasetUri)}}
            />
        </div>
    }

    if(isLoading || !dataset) {
        return <div className={"py-8 h-full flex items-center"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"w-full h-full"} style={{maxWidth: maxWidth}}>
        <DatasetFullView dataset={{
            $type: "ar.cabildoabierto.data.dataset#datasetViewBasic",
            ...dataset
        }}
            />
    </div>
}


const EditorViewerViewData = ({config, maxWidth}: {
    config: PlotConfigProps
    maxWidth?: number | string
}) => {

    if(config.dataSource && isDatasetDataSource(config.dataSource)){
        if(config.dataSource.dataset){
            return <EditorViewerViewDataForDataset
                datasetUri={config.dataSource.dataset}
                maxWidth={maxWidth}
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


export const EditorViewer = ({config, selected, setSelected, maxWidth, onSave}: {
    config: PlotConfigProps
    selected: string
    setSelected: (s: string) => void
    maxWidth: number
    onSave: (v: Visualization) => void
}) => {

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] w-32">
            <Button
                variant={"text"}
                color={"background"}
                sx={{borderRadius: 0, paddingY: 0, borderBottomRightRadius: 8, borderBottomLeftRadius: 8}}
                fullWidth={true}
            >
                <div
                    className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className={"h-full"}>
        <div className={"flex flex-col items-center justify-between h-full"}>
            <div className={"h-32"}>
                <div className={"border-b border-l border-r rounded-b-lg flex justify-center"}>
                    <SelectionComponent
                        onSelection={(v) => {
                            setSelected(v)
                        }}
                        options={["Datos", "Visualización"]}
                        selected={selected}
                        optionsNodes={optionsNodes}
                        className="flex justify-center"
                    />
                </div>
            </div>
            {selected == "Visualización" && <EditorViewerViewVisualization
                config={config}
                maxWidth={maxWidth}
                onSave={onSave}
            />}
            {selected == "Datos" && <EditorViewerViewData
                config={config}
                maxWidth={maxWidth}
            />}
        </div>
    </div>
}
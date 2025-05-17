import {PlotConfigProps} from "@/lib/types";
import SelectionComponent from "@/components/buscar/search-selection-component";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {emptyChar} from "@/utils/utils";
import {
    DatasetView,
    DatasetViewBasic,
    isDatasetView,
    isDatasetViewBasic
} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {$Typed} from "@atproto/api";
import {
    isDatasetDataSource,
    validateMain as validateVisualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {Plot} from "@/components/visualizations/plot";
import {Main as Visualization, View as VisualizationView} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import { Button } from "../../../../modules/ui-utils/src/button";


function readyToPlot(config: PlotConfigProps) {
    const res = validateVisualization(config)
    return res.success
}


function readyToSave(config: PlotConfigProps) {
    if (!readyToPlot(config)) return false
    // TO DO: Si hace falta algo más (ej. título?) pedir
    return true
}


function nextStep(config: PlotConfigProps) {
    const datasetAvailable = config.dataSource && isDatasetDataSource(config.dataSource) && config.dataSource.dataset

    if (!datasetAvailable) {
        return "Elegí un conjunto de datos."
    } else {
        return "Configurá la visualización"
    }
}


function makeVisualizationView(visualization: Visualization, dataset: $Typed<DatasetView>): VisualizationView {
    return {
        ...visualization,
        $type: "ar.cabildoabierto.embed.visualization#view",
        dataset
    }
}

type EditorViewerViewVisualizationProps = {
    dataset: $Typed<DatasetView> | $Typed<DatasetViewBasic>
    config: PlotConfigProps
    maxWidth: number
    onSave: (v: VisualizationView) => void
}

export const EditorViewerViewVisualization = ({dataset, config, maxWidth, onSave}: EditorViewerViewVisualizationProps) => {

    async function onClickDone() {
        const res = validateVisualization(config)
        if(res.success && isDatasetView(dataset)){
            onSave(makeVisualizationView(res.value, dataset))
        } else {
            return {error: "Parece que falta configurar algo."}
        }
    }

    if (isDatasetViewBasic(dataset)) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    const validatedVisualization = validateVisualization(config)
    const visualization = validatedVisualization.success ? validatedVisualization.value : null

    const datasetAvailable = config.dataSource && isDatasetDataSource(config.dataSource) && config.dataSource.dataset

    return <div className={"flex flex-col justify-between h-full"}>
        {visualization && <>
            {readyToPlot(config) ?
                <div style={{maxWidth: maxWidth}} className={"overflow-x-auto overflow-y-auto"}>
                    <Plot
                        visualization={makeVisualizationView(visualization, dataset)}
                    />
                </div> :
                nextStep(config)}
            {readyToSave(config) ?
                <div className={"h-12 pb-4 flex justify-center w-full"}>
                    {datasetAvailable && <Button
                        onClick={onClickDone}
                        disabled={!isDatasetView(dataset)}
                    >
                        <span className={"font-bold"}>
                            Listo
                        </span>
                    </Button>}
                </div> :
                <div className={"h-12"}>{emptyChar}</div>}
        </>}
    </div>
}


export const EditorViewer = ({config, selected, setSelected, dataset, maxWidth, onSave}: {
    config: PlotConfigProps
    selected: string
    setSelected: (s: string) => void
    dataset?: $Typed<DatasetView> | $Typed<DatasetViewBasic>
    maxWidth: number
    onSave: (v: VisualizationView) => void
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
                dataset={dataset}
                config={config}
                maxWidth={maxWidth}
                onSave={onSave}
            />}
            {selected == "Datos" && <div className={"h-full pb-10 w-full"}>
                {dataset && isDatasetView(dataset) &&
                    <div className={"w-full h-full"} style={{maxWidth: maxWidth}}>
                        <DatasetFullView dataset={dataset}/>
                    </div>
                }
                {!dataset &&
                    <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
                        {nextStep(config)}
                    </div>
                }
                {dataset && isDatasetViewBasic(dataset) &&
                    <div className={"py-8"}>
                        <LoadingSpinner/>
                    </div>}
            </div>
            }
        </div>
    </div>
}
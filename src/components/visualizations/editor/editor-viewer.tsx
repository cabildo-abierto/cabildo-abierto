import {PlotConfigProps} from "@/lib/types";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {Button} from "@mui/material";
import SelectionComponent from "@/components/buscar/search-selection-component";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {emptyChar} from "@/utils/utils";
import {
    DatasetView,
    DatasetViewBasic,
    isDatasetView,
    isDatasetViewBasic
} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {DatasetFullView} from "@/components/datasets/dataset-full-view";
import {$Typed} from "@atproto/api";
import {isDatasetVisualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {isMain as isVisualization, validateMain as validateVisualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";
import {Plot} from "@/components/visualizations/plot";



function readyToPlot(config: PlotConfigProps) {
    const res = validateVisualization(config)
    return res.success
}


function readyToSave(config: PlotConfigProps) {
    if (!readyToPlot(config)) return false
    if (!config["Título"] || config["Título"].length == 0) return false
    return true
}


function nextStep(config: PlotConfigProps) {
    const datasetAvailable = config.dataSource && isDatasetVisualization(config.dataSource) && config.dataSource.dataset

    if (!datasetAvailable) {
        return "Elegí un conjunto de datos."
    } else {
        return "Configurá la visualización"
    }
}


function nextStepToPublish(config: PlotConfigProps) {
    if (!readyToPlot(config)) return ""
    if (!readyToSave(config)) return "Elegí un título."
    return ""
}


const dataURLToFile = (dataURL: string) => {
    // Extract the Base64-encoded string from the data URL
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1]; // Extract the MIME type (e.g., image/png)
    const bstr = atob(arr[1]); // Decode the Base64 string
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    // Convert the decoded string into a byte array
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    // Create and return a File object
    return new File([u8arr], "f", {type: mime});
}


export const EditorViewer = ({config, selected, setSelected, dataset, maxWidth}: {
    config: PlotConfigProps
    selected: string
    setSelected: (s: string) => void
    dataset?: $Typed<DatasetView> | $Typed<DatasetViewBasic>
    maxWidth: number
}) => {
    const router = useRouter()
    const [currentView, setCurrentView] = useState(null)
    const saveDisabled = !readyToSave(config)

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)] w-32">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0
                }}
            >
                <div
                    className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    async function onSave() {
        //let spec = getSpecForConfig(config, dataset)

        return {error: "Sin implementar."}
    }

    const datasetAvailable = config.dataSource && isDatasetVisualization(config.dataSource) && config.dataSource.dataset

    const validatedVisualization = validateVisualization(config)
    const visualization = validatedVisualization.success ? validatedVisualization.value : null

    return <div className={"h-screen"}>
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
            {selected == "Visualización" && isDatasetView(dataset) && visualization && <div>
                {
                    readyToPlot(config) ?
                        <div style={{maxWidth: maxWidth}} className={"overflow-x-auto overflow-y-auto"}>
                            <Plot
                                dataset={dataset} visualization={visualization}
                            />
                        </div> :
                        <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
                            {nextStep(config)}
                        </div>
                }
            </div>}
            {selected == "Visualization" && isDatasetViewBasic(dataset) && <div className={"py-8"}>
                <LoadingSpinner/>
            </div>}
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
            {selected == "Visualización" ?
                <div className={"h-32 pb-4 flex flex-col justify-end"}>
                    <div className={"text-sm text-[var(--text-light)] text-center mb-1"}>
                        {nextStepToPublish(config)}
                    </div>
                    {datasetAvailable && <StateButton
                        textClassName={"font-bold"}
                        handleClick={onSave}
                        text1={"Publicar"}
                        disabled={saveDisabled}
                    />}
                </div> :
                <div className={"h-32"}>{emptyChar}</div>
            }
        </div>
    </div>
}
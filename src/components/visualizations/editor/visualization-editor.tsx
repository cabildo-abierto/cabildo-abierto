import {useDatasets} from "@/queries/api";
import {useEffect, useState} from "react";
import {PlotConfigProps} from "@/lib/types";
import {EditorViewer} from "./editor-viewer";
import {AcceptButtonPanel} from "../../../../modules/ui-utils/src/accept-button-panel";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import {
    isColumnFilter,
    Main as Visualization, validateColumnFilter,
    validateMain as validateVisualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import VisualizationEditorSidebar from "@/components/visualizations/editor/visualization-editor-sidebar";
import {Button} from "../../../../modules/ui-utils/src/button";
import {emptyChar} from "@/utils/utils";
import {post} from "@/utils/fetch";
import {TopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useQuery} from "@tanstack/react-query";


const ErrorPanel = ({msg}: { msg?: string }) => {
    const [openMsgPopup, setOpenMsgPopup] = useState(msg != null)

    return <AcceptButtonPanel
        open={openMsgPopup}
        onClose={() => {
            setOpenMsgPopup(false)
        }}
    >
        <div className={"flex flex-col items-center pb-6 px-6 max-w-[400px]"}>
            <h2 className={"mb-4"}>Ocurrió un error</h2>
            <div className={"text-center text-[var(--text-light)]"}>
                {msg}
            </div>
        </div>
    </AcceptButtonPanel>
}


export function readyToPlot(config: PlotConfigProps): config is Visualization {
    const res = validateVisualization(config)
    return res.success
}


type VisualizationEditorProps = {
    onSave: (v: Visualization) => void
    msg?: string
    initialConfig?: PlotConfigProps
    onClose: () => void
}

type TopicDatasetSpec = {
    filters: Visualization["filters"]
}

async function fetchTopicsDataset(filters: PlotConfigProps["filters"]) {
    const validFilters: Visualization["filters"] = []
    for(let i = 0; i < filters.length; i++) {
        const f = filters[i]
        if(isColumnFilter(f)){
            const valid = validateColumnFilter(f)
            if(valid.success){
                validFilters.push(valid.value)
            } else if(valid.success == false){
                return {error: "Uno de los filtros aplicados es inválido."}
            }
        } else {
            return {error: `Uno de los filtros aplicados es inválido`}
        }
    }

    return await post<TopicDatasetSpec, TopicsDatasetView>("/topics-dataset", {filters: validFilters})
}


export const useTopicsDataset = (filters: PlotConfigProps["filters"], load: boolean = false) => {
    return useQuery({
        queryKey: ['topics-dataset', filters],
        queryFn: () => fetchTopicsDataset(filters),
        enabled: load && !!filters
    })
}


export const VisualizationEditor = ({initialConfig, msg, onClose, onSave}: VisualizationEditorProps) => {
    const {data: datasets} = useDatasets()
    const [config, setConfig] = useState<PlotConfigProps>(initialConfig ? initialConfig : {$type: "ar.cabildoabierto.embed.visualization"})
    const [selected, setSelected] = useState(initialConfig ? "Visualización" : "Datos")
    const editorMinWidth = 1080
    const [wideEnough, setWideEnough] = useState(window.innerWidth >= editorMinWidth)
    const [width, setWidth] = useState(window.innerWidth-50)
    const [height, setHeight] = useState(window.innerHeight-50)
    const {refetch} = useTopicsDataset(config.filters)

    const baseSidebarWidth = Math.max(width / 4, 350)

    useEffect(() => {
        const handleResize = () => {
            setWideEnough(window.innerWidth >= editorMinWidth)
            setWidth(window.innerWidth-50)
            setHeight(window.innerHeight-50)
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    async function onReloadData() {
        await refetch()
        return {}
    }

    if (!wideEnough) {
        return <div>
            <div className="absolute top-1 right-1">
                <CloseButton size="small" onClose={onClose} color={"background"}/>
            </div>
            <div className={"h-screen flex w-screen justify-center text-center items-center text-[var(--text-light)]"}>
                Abrí el editor en una pantalla más grande
            </div>
        </div>
    }

    return <div className={"flex relative"} style={{width, height}}>
        <div className="absolute h-12 top-1 right-1 flex space-x-2 items-start">
            <CloseButton size="small" onClose={onClose} color={"background"}/>
        </div>
        {selected == "Visualización" && <div className="absolute bottom-2 right-2 flex space-x-2 items-start">
            {readyToPlot(config) ?
                <div className={"flex justify-center w-full"}>
                    <Button
                        onClick={() => {
                            onSave(config)
                        }}
                        size={"medium"}
                        color={"transparent"}
                    >
                    <span className={"font-bold"}>
                        Guardar
                    </span>
                    </Button>
                </div> :
                <div className={"h-12"}>{emptyChar}</div>
            }
        </div>}

        <div style={{width: baseSidebarWidth}}>
            <VisualizationEditorSidebar
                datasets={datasets}
                config={config}
                setConfig={setConfig}
                selected={selected}
                setSelected={setSelected}
                baseWidth={baseSidebarWidth}
                maxWidth={width / 2}
                onReloadData={onReloadData}
            />
        </div>

        <div className={"flex-1"} style={{width: width - baseSidebarWidth}}>
            <div style={{height}} className={"flex flex-col grow"}>
                <EditorViewer
                    config={config}
                    selected={selected}
                    onSave={onSave}
                />
            </div>
        </div>

        <ErrorPanel msg={msg}/>
    </div>
}
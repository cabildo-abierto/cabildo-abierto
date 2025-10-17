import {useEffect, useState} from "react";
import {PlotConfigProps} from "@/lib/types";
import {EditorViewer} from "./editor-viewer";
import {AcceptButtonPanel} from "../../layout/utils/accept-button-panel";
import {CloseButton} from "../../layout/utils/close-button";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import VisualizationEditorSidebar from "@/components/visualizations/editor/visualization-editor-sidebar";
import {Button} from "../../layout/utils/button";
import {emptyChar} from "@/utils/utils";
import {post} from "@/utils/fetch";
import {TopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useDatasets} from "@/queries/getters/useDataset";
import {StateButtonClickHandler} from "../../layout/utils/state-button";
import {$Typed} from "@/lex-api/util";
import { produce } from "immer";


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


export function readyToPlot(config: PlotConfigProps): config is ArCabildoabiertoEmbedVisualization.Main {
    const res = ArCabildoabiertoEmbedVisualization.validateMain(config)
    if(res.success == false){
        console.log("invalid vis", res.error)
        console.log("config", config)
    }
    return res.success
}


type VisualizationEditorProps = {
    onSave: (v: ArCabildoabiertoEmbedVisualization.Main) => void
    msg?: string
    initialConfig?: PlotConfigProps
    onClose: () => void
}

type TopicDatasetSpec = {
    filters: ArCabildoabiertoEmbedVisualization.Main["filters"]
}

export function validateColumnFilters(filters: PlotConfigProps["filters"]): $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[] {
    const validFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[] = []
    for(let i = 0; i < filters.length; i++) {
        const f = filters[i]
        if(ArCabildoabiertoEmbedVisualization.isColumnFilter(f)){
            const valid = ArCabildoabiertoEmbedVisualization.validateColumnFilter(f)
            if(valid.success){
                validFilters.push(valid.value)
            }
        }
    }
    return validFilters
}

async function fetchTopicsDataset(filters: PlotConfigProps["filters"]) {
    const validFilters: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[] = validateColumnFilters(filters)

    if(validFilters.length > 0){
        return await post<TopicDatasetSpec, TopicsDatasetView>("/topics-dataset", {filters: validFilters})
    } else {
        if(filters.length == 0){
            return {error: "Agregá algún filtro."}
        } else {
            return {error: "El filtro es inválido."}
        }
    }
}


export const useTopicsDataset = (filters: PlotConfigProps["filters"], load: boolean = false) => {
    const queryFn = async () => {
        const {error, data} = await fetchTopicsDataset(filters)
        if(error) throw Error(error)
        return {data}
    }

    return useQuery({
        queryKey: ['topics-dataset', filters],
        queryFn,
        enabled: load && !!filters
    })
}


export const VisualizationEditor = ({
                                        initialConfig,
                                        msg,
                                        onClose,
                                        onSave
}: VisualizationEditorProps) => {
    const {data: datasets} = useDatasets()
    const [config, setConfig] = useState<PlotConfigProps>(initialConfig ? initialConfig : {$type: "ar.cabildoabierto.embed.visualization"})
    const [selected, setSelected] = useState(initialConfig ? "Visualización" : "Datos")
    const editorMinWidth = 1080
    const [wideEnough, setWideEnough] = useState(window.innerWidth >= editorMinWidth)
    const [width, setWidth] = useState(window.innerWidth-50)
    const [height, setHeight] = useState(window.innerHeight-50)
    const {refetch} = useTopicsDataset(config.filters)
    const qc = useQueryClient()
    const [creatingNewDataset, setCreatingNewDataset] = useState(false)

    const baseSidebarWidth = Math.max(width / 4, 350)

    useEffect(() => {
        if(config.dataSource) {
            setCreatingNewDataset(false)
        }
    }, [config]);

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

    const onReloadData: StateButtonClickHandler = async () =>  {
        await qc.cancelQueries({queryKey: config.filters})
        const {error} = await refetch()
        if(error && error.message) return {error: error.message}
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
                setSelected={(v: string) => {
                    setCreatingNewDataset(false)
                    setSelected(v)
                }}
                baseWidth={baseSidebarWidth}
                maxWidth={width / 2}
                onReloadData={onReloadData}
                onNewDataset={() => {
                    if(config.dataSource) {
                        setConfig(produce(config, draft => {
                            draft.dataSource = null
                        }))
                    }
                    setCreatingNewDataset(true);
                }}
                creatingNewDataset={creatingNewDataset}
            />
        </div>

        <div className={"flex-1"} style={{width: width - baseSidebarWidth}}>
            <div style={{height}} className={"flex flex-col grow"}>
                <EditorViewer
                    config={config}
                    selected={selected}
                    onSave={onSave}
                    creatingNewDataset={creatingNewDataset}
                    setCreatingNewDataset={(v: boolean) => {
                        if(v) {
                            if(config.dataSource) {
                                setConfig(produce(config, draft => {
                                    draft.dataSource = null
                                }))
                            }
                        }
                        setCreatingNewDataset(v)
                    }}
                />
            </div>
        </div>

        <ErrorPanel msg={msg}/>
    </div>
}
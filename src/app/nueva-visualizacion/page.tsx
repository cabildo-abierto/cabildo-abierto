"use client"
import {useDatasets} from "../../hooks/contents";
import LoadingSpinner from "../../components/loading-spinner";
import {ErrorPage} from "../../components/error-page";
import {useEffect, useRef, useState} from "react";
import {getDataset, saveVisualization} from "../../actions/data";
import SearchableDropdown from "../../components/ui-utils/searchable-dropdown";
import {DatasetProps, FilterProps, PlotConfigProps} from "../lib/definitions";
import {BasicButton} from "../../components/ui-utils/basic-button";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import StateButton from "../../components/state-button";
import {VisualizationOnEditor} from "../../components/visualizations/visualization-on-editor";
import { getSpecForConfig } from "../../components/visualizations/spec";
import {View} from "vega";
import {useRouter} from "next/navigation";
import {DatasetPreviewSmall} from "../../components/datasets/dataset-preview";
import {Button, IconButton, TextField} from "@mui/material";
import {Select} from "../../components/ui-utils/select";
import {cleanText, emptyChar} from "../../components/utils";
import SelectionComponent from "../../components/search-selection-component";
import {DatasetView} from "../../components/datasets/dataset-view";
import ResizableDiv from "../../components/ui-utils/resizable-div";



function readyToPlot(config: PlotConfigProps){
    if(config.kind == null || config.kind == "Tipo de gráfico") return false
    if(config.dataset == null) return false
    if(config.kind == "Histograma"){
        if(!config["Columna"] || config["Columna"].length == 0) return false
    } else if(config.kind == "Gráfico de barras" || config.kind == "Gráfico de línea"){
        if(!config["Eje x"] || config["Eje x"].length == 0) return false
        if(!config["Eje y"] || config["Eje y"].length == 0) return false
    }
    return true
}

function readyToSave(config: PlotConfigProps){
    if(!readyToPlot(config)) return false
    if(!config["Título"] || config["Título"].length == 0) return false
    return true
}

const twoAxis: PropReq[] = [
    {label: "Eje x", type: "column"},
    {label: "Eje y", type: "column"}
]

const title: PropReq = {label: "Título", type: "string"}

type PropReq = {
    label: string
    type: "column" | "string"
}

const configReq = new Map<String, PropReq[]>([
    ["Gráfico de barras", [...twoAxis, title]],
    ["Gráfico de línea", [...twoAxis, title]],
    ["Histograma", [{
        label: "Columna",
        type: "column"
    }, title]]
])


const ChooseDatasetPanel = ({datasets, config, updateConfig}: {
    datasets?: DatasetProps[],
    config: PlotConfigProps,
    updateConfig: (k: string, v: any) => void
}) => {
    const [searchValue, setSearchValue] = useState<string>("")
    const [filteredDatasets, setFilteredDatasets] = useState<DatasetProps[]>(datasets)

    useEffect(() => {

        const v = cleanText(searchValue)
        const f = datasets ? datasets.filter((d) => {
            if(v.length == 0) return true
            return cleanText(d.dataset.title).includes(v)
        }) : undefined

        setFilteredDatasets(f)
    }, [searchValue, datasets])

    return <div className={"mt-16"}>
        <ResizableDiv initialWidth={320} minWidth={240} maxWidth={400} side={"right"}>
            <div className={"border rounded-lg p-2 flex flex-col"}>
                <div>
                    <div className={"font-bold text-2xl"}>
                        Datos
                    </div>
                    <hr className={"my-2"}/>
                    <TextField
                        value={searchValue}
                        size={"small"}
                        fullWidth={true}
                        placeholder={"buscar"}
                        onChange={(e) => {setSearchValue(e.target.value)}}
                    />
                </div>
                <div className={"space-y-1 mt-2 overflow-y-auto max-h-[calc(100vh-140px)]"}>
                    {filteredDatasets ? filteredDatasets.map((d, i) => {
                        return <div key={i} className={""}>
                            <DatasetPreviewSmall
                                dataset={d}
                                selected={config.dataset && config.dataset.cid == d.cid}
                                onClick={() => {
                                    updateConfig("dataset", d)
                                }}/>
                        </div>
                    }) : <div className={"mt-8"}><LoadingSpinner/></div>}
                </div>
            </div>
        </ResizableDiv>
    </div>
}


const FilterConfig = ({filter, updateFilter, config, dataset, onRemove}: {
    config: PlotConfigProps,
    dataset: { dataset?: DatasetProps },
    filter: FilterProps,
    updateFilter: (f: FilterProps) => void,
    onRemove: () => void
}) => {

    return <div className={"flex items-center space-x-2"}>
        <SearchableDropdown
            options={config.dataset ? config.dataset.dataset.columns : []}
            label={"Columna"}
            size={"small"}
            fontSize={"14px"}
            onSelect={(c: string) => {
                updateFilter({column: c, op: filter.op, value: filter.value})
            }}
        />
        <SearchableDropdown
            options={["igual a", "distinto de"]}
            label={"Operador"}
            size={"small"}
            fontSize={"14px"}
            onSelect={(c: "igual a" | "distinto de") => {
                updateFilter({
                    op: c,
                    column: filter.column,
                    value: filter.value
                })
            }}
        />
        <SearchableDropdown
            options={dataset && dataset.dataset.dataset.columnValues && filter.column && dataset.dataset.dataset.columnValues.get(filter.column).length <= 8 ? dataset.dataset.dataset.columnValues.get(filter.column) : []}
            label={"Valor"}
            size={"small"}
            fontSize={"14px"}
            onSelect={(c) => {
                updateFilter({
                    value: c,
                    column: filter.column,
                    op: filter.op
                })
            }}
        />
        <IconButton
            size={"small"}
            onClick={onRemove}
        >
            <RemoveIcon fontSize={"small"}/>
        </IconButton>
    </div>
}


const ConfigPanel = ({config, updateConfig, dataset}: {
    config: PlotConfigProps
    updateConfig: (k: string, v: any) => void
    dataset?: { dataset?: DatasetProps }
}) => {

    function updateFilter(i: number, value: FilterProps) {
        updateConfig("filters", [...config.filters.slice(0, i), value, ...config.filters.slice(i + 1)])
    }

    return <ResizableDiv initialWidth={400} minWidth={240} maxWidth={500} side={"left"}>
        <div className={"border rounded-lg p-2 mt-16 w-full"}>
            <div className={"font-bold text-2xl"}>
                Configuración
            </div>
            <hr className={"my-2"}/>
            <div className={"flex flex-col mt-8 space-y-4 px-2 mb-2"}>
                <Select
                    options={["Histograma", "Gráfico de línea", "Gráfico de barras"]}
                    value={config.kind}
                    onChange={(v) => {
                        updateConfig("kind", v)
                    }}
                    label="Tipo de gráfico"
                    firstDisabled={true}
                />
                {config.kind != "Tipo de gráfico" && config.dataset != null && <>
                    {configReq.get(config.kind).map((req, i) => {
                        if (req.type == "column") {
                            return <div key={i}>
                                <SearchableDropdown
                                    options={config.dataset.dataset.columns}
                                    label={req.label}
                                    size={"small"}
                                    onSelect={(v: string) => {
                                        updateConfig(req.label, v)
                                    }}
                                />
                            </div>
                        } else if (req.type == "string") {
                            return <div key={i}>
                                <TextField
                                    label={req.label}
                                    size={"small"}
                                    value={config[req.label]}
                                    InputProps={{autoComplete: "off"}}
                                    fullWidth={true}
                                    onChange={(e) => {
                                        updateConfig(req.label, e.target.value)
                                    }}
                                />
                            </div>
                        }
                        {
                            throw Error("Not implemented.")
                        }
                    })}
                </>}
                {config.filters && config.filters.map((f, i) => {
                    return <div key={i}>
                        <FilterConfig filter={f} config={config} dataset={dataset}
                            onRemove={() => {
                                updateConfig("filters", [...config.filters.slice(0, i), ...config.filters.slice(i + 1)])
                            }}
                            updateFilter={(f: FilterProps) => {
                                updateFilter(i, f)
                            }}
                        />
                    </div>
                })}
                <div>
                    <BasicButton
                        color={"inherit"}
                        startIcon={<AddIcon/>}
                        onClick={() => {
                            updateConfig("filters", [...config.filters, {}])
                        }}
                        size={"small"}
                        variant={"text"}
                    >
                        Filtro
                    </BasicButton>
                </div>
            </div>
        </div>
    </ResizableDiv>
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


function nextStep(config: PlotConfigProps) {
    if (config.dataset == null) {
        return "Elegí un conjunto de datos."
    } else if (config.kind == null || config.kind == "Tipo de gráfico") {
        return "Elegí un tipo de gráfico."
    } else {
        if (config.kind == "Histograma") {
            if (!config["Columna"] || config["Columna"].length == 0) return "Elegí una columna."
        } else if (config.kind == "Gráfico de barras" || config.kind == "Gráfico de línea") {
            if (!config["Eje x"] || config["Eje x"].length == 0) return "Elegí un eje x."
            if (!config["Eje y"] || config["Eje y"].length == 0) return "Elegí un eje y."
        }
    }
    return ""
}


function nextStepToPublish(config: PlotConfigProps) {
    if (!readyToPlot(config)) return ""
    if (!readyToSave(config)) return "Elegí un título."
    return ""
}


const EditorViewer = ({config, selected, setSelected, dataset, maxWidth}: {
    config: PlotConfigProps
    selected: string
    setSelected: (s: string) => void
    dataset?: { dataset?: DatasetProps, data?: any[] }
    maxWidth: number
}) => {
    const router = useRouter()
    const [currentView, setCurrentView] = useState<View | null>(null)
    const saveDisabled = !readyToSave(config)

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0

                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    async function onSave() {
        const spec = getSpecForConfig(config)

        const canvas = await currentView.toCanvas(10);
        const dataURL = canvas.toDataURL("image/png")

        const file = dataURLToFile(dataURL)
        const formData = new FormData()
        formData.set("data", file)
        const {error} = await saveVisualization(spec, formData)

        if (!error) router.push("/datos")
        return {error}
    }

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
            {selected == "Visualización" && <div style={{maxWidth: maxWidth}} className={"overflow-x-scroll overflow-y-clip"}>
                {
                    readyToPlot(config) ?
                        <VisualizationOnEditor dataset={dataset} config={config} setCurrentView={setCurrentView}/> :
                        <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
                            {nextStep(config)}
                        </div>
                }
            </div>}
            {selected == "Datos" && <div className={"h-full w-full"}>
                {dataset && dataset.data ? <div className={"w-full"}>
                    <div className={"font-bold text-2xl mt-4"}>
                        {dataset.dataset.dataset.title}
                    </div>
                    <div className={"w-full"}>
                        <DatasetView data={dataset.data} maxHeight={"500px"}
                                     maxWidth={maxWidth.toString() + "px"}/>
                    </div>
                </div> : (dataset ? <LoadingSpinner/> :
                    <div className={"h-full flex items-center justify-center text-[var(--text-light)]"}>
                        {nextStep(config)}
                    </div>)}
            </div>
            }
            {selected == "Visualización" ? <>
                <div className={"h-32 pb-4 flex flex-col justify-end"}>
                    <div className={"text-sm text-[var(--text-light)] text-center mb-1"}>
                        {nextStepToPublish(config)}
                    </div>
                    {config.dataset && <StateButton
                        textClassName={"font-bold"}
                        handleClick={onSave}
                        text1={"Publicar"}
                        disabled={saveDisabled}
                    />}
                </div>
            </> : <div className={"h-32"}>{emptyChar}</div>}
        </div>
    </div>
}

const Page = () => {
    const { datasets } = useDatasets();
    const [config, setConfig] = useState<PlotConfigProps>({ filters: [], kind: "Tipo de gráfico" });
    const [dataset, setDataset] = useState<{ dataset?: DatasetProps, data?: any[] } | null>(null);
    const [selected, setSelected] = useState("Datos");
    const sidebarWidth = 80;
    const [rightSideWidth, setRightSideWidth] = useState(400);
    const [leftSideWidth, setLeftSideWidth] = useState(320);
    const [centerMaxWidth, setCenterMaxWidth] = useState(window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth);

    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const editorMinWidth = 1080
    const [wideEnough, setWideEnough] = useState(window.innerWidth >= editorMinWidth)

    useEffect(() => {

        const handleResize = () => {
            setCenterMaxWidth(
                window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth
            );
            setWideEnough(window.innerWidth >= editorMinWidth)
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    useEffect(() => {
        setCenterMaxWidth(
            window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth
        )
    }, [leftSideWidth, rightSideWidth])

    // Observe left component resize
    useEffect(() => {
        if (leftRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width } = entry.contentRect;
                    setLeftSideWidth(width);
                }
            });

            resizeObserver.observe(leftRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    // Observe right component resize
    useEffect(() => {
        if (rightRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width } = entry.contentRect;
                    setRightSideWidth(width);
                }
            });

            resizeObserver.observe(rightRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    // Fetch dataset when config.dataset changes
    useEffect(() => {
        async function getSelectedDataset() {
            setDataset({ dataset: config.dataset });
            const d = await getDataset(config.dataset.uri);
            setDataset(d);
        }

        if (config.dataset) {
            getSelectedDataset();
        }
    }, [config.dataset]);

    const updateConfig = (key, value) => {
        setConfig((prevState) => ({
            ...prevState,
            [key]: value,
        }));
        if (selected != "Visualización" && key != "dataset") {
            setSelected("Visualización");
        }
    }

    if(!wideEnough){
        return <div className={"h-screen w-full flex justify-center items-center text-[var(--text-light)]"}>
            Abrí el editor en una pantalla más grande.
        </div>
    }

    const center = (
        <EditorViewer
            config={config}
            selected={selected}
            setSelected={setSelected}
            maxWidth={centerMaxWidth-8*4-3*4-8*4-4*4}
            dataset={dataset}
        />
    );

    const left = (
        <div ref={leftRef} className={"pr-8 pl-3"}>
            <ChooseDatasetPanel
                datasets={datasets}
                config={config}
                updateConfig={updateConfig}
            />
        </div>
    );

    const right = (
        <div ref={rightRef} className={"pl-8 pr-4"}>
            <ConfigPanel
                config={config}
                updateConfig={updateConfig}
                dataset={dataset}
            />
        </div>
    );

    return (
        <div className={"flex justify-between w-[calc(100vw-80px)]"}>
            <div>{left}</div>
            <div className={"flex-grow"}>{center}</div>
            <div>{right}</div>
        </div>
    );
};

export default Page
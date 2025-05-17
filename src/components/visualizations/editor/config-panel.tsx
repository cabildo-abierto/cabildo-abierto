import {PlotConfigProps} from "@/lib/types";
import ResizableDiv from "../../../../modules/ui-utils/src/resizable-div";
import {Select} from "../../../../modules/ui-utils/src/select";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {isTwoAxisPlot, PlotSpecificConfig} from "@/components/visualizations/editor/plot-specific-config";
import {produce} from "immer";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import {Button} from "../../../../modules/ui-utils/src/button";
import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {TextField} from "@mui/material";
import {isHistogram} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";


export function kindToLexicon(kind: string): string {
    const dict = {
        "Histograma": "histogram",
        "Gráfico de línea": "lines",
        "Gráfico de barras": "barplot",
        "Gráfico de puntos": "scatterplot",
        "Hemiciclo": "hemicycleVisualization"
    }

    return "ar.cabildoabierto.embed.visualization#" + dict[kind];
}


export function lexiconToKind(lexicon: string): string {
    const dict = {
        "histogram": "Histograma",
        "lines": "Gráfico de línea",
        "barplot": "Gráfico de barras",
        "scatterplot": "Gráfico de puntos",
        "hemicycleVisualization": "Hemiciclo"
    }
    if (!lexicon.includes("#")) return ""
    return dict[lexicon.split("#")[1]];
}


const ConfigPanelText = ({config, setConfig, dataset}: {dataset: DatasetView | DatasetViewBasic, config: PlotConfigProps, setConfig: (v: PlotConfigProps) => void}) => {
    return <>
        <TextField
            label={"Título"}
            size={"small"}
            value={config.title ?? ""}
            onChange={e => {
                setConfig(produce(config, draft => {
                    draft.title = e.target.value
                }))
            }}
        />
        <TextField
            label={"Epígrafe"}
            multiline
            size={"small"}
            value={config.caption ?? ""}
            onChange={e => {
                setConfig(produce(config, draft => {
                    draft.caption = e.target.value
                }))
            }}
        />
        {(isTwoAxisPlot(config.spec) || isHistogram(config.spec)) && <TextField
            label={"Etiqueta eje x"}
            size={"small"}
            value={config.spec.xLabel ?? config.spec.xAxis}
            onChange={e => {
                setConfig(produce(config, draft => {
                    if(isTwoAxisPlot(draft.spec) || isHistogram(draft.spec)){
                        draft.spec.xLabel = e.target.value
                    }
                }))
            }}
        />}
        {isTwoAxisPlot(config.spec) && <TextField
            label={"Etiqueta eje y"}
            size={"small"}
            value={config.spec.yLabel ?? config.spec.yAxis}
            onChange={e => {
                setConfig(produce(config, draft => {
                    if(isTwoAxisPlot(draft.spec)){
                        draft.spec.yLabel = e.target.value
                    }
                }))
            }}
        />}
    </>
}


const ConfigPanelVisualization = ({config, setConfig, dataset}: {dataset: DatasetView | DatasetViewBasic, config: PlotConfigProps, setConfig: (v: PlotConfigProps) => void}) => {
    return <>
        <Select
            options={["Histograma", "Gráfico de línea", "Gráfico de barras", "Gráfico de dispersión"]}
            value={config.spec && config.spec.$type ? lexiconToKind(config.spec.$type) : ""}
            onChange={(v) => {
                setConfig(produce(config, draft => {
                    if (!draft.spec) draft.spec = {}
                    draft.spec.$type = kindToLexicon(v)
                }))
            }}
            label="Tipo de gráfico"
            fontSize={"14px"}
            labelShrinkFontSize={"14px"}
        />
        <PlotSpecificConfig
            config={config}
            setConfig={setConfig}
            dataset={dataset}
        />
        {/*config.filters && config.filters.map((f, i) => {
                    return <div key={i}>
                        <FilterConfig
                            filter={f}
                            dataset={dataset}
                            onRemove={() => {
                                updateConfig("filters", [...config.filters.slice(0, i), ...config.filters.slice(i + 1)])
                            }}
                            updateFilter={(f: FilterProps) => {
                                updateFilter(i, f)
                            }}
                        />
                    </div>
                })*/}
        {/*<div>
                    <Button
                        color={"background-dark"}
                        startIcon={<AddIcon/>}
                        onClick={() => {
                            updateConfig("filters", [...(config.filters ? config.filters : []), {}])
                        }}
                        size={"small"}
                        variant={"text"}
                        sx={{borderRadius: "20px", paddingX: "12px", ":hover": {backgroundColor: "var(--background-dark3)"}, backgroundColor: "var(--background-dark)"}}
                    >
                        Filtro
                    </Button>
                </div>*/}
        <div className={"flex justify-end"}>
            {/* TO DO <IconButton size={"small"}
                    onClick={() => {openJsonInNewTab(getSpecForConfig(config, {dataset}))}}
                >
                    <CodeIcon fontSize={"small"}/>
                </IconButton>*/}
        </div>
    </>
}


export const ConfigPanel = ({config, setConfig, dataset}: {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
    dataset?: DatasetView | DatasetViewBasic
}) => {
    const [selectedMenu, setSelectedMenu] = useState<string>("Visualización")

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                onClick={() => {
                }}
                variant="text"
                color={"background-dark"}
                fullWidth={true}
                size={"small"}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0,
                }}
            >
                <div
                    className={"pb-1 mx-2 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <ResizableDiv initialWidth={400} minWidth={240} maxWidth={500} side={"left"}>
        <div className={"rounded-lg p-2 mt-16 w-full bg-[var(--background-dark)]"}>
            <div className={"font-bold text-2xl pt-1 px-2"}>
                Configuración
            </div>

            <div className={"flex border-b w-full mt-2"}>
                <SelectionComponent
                    options={["Visualización", "Texto"]}
                    optionsNodes={optionsNodes}
                    selected={selectedMenu}
                    onSelection={(v: string) => {
                        setSelectedMenu(v)
                    }}
                    className={"flex justify-center"}
                />
            </div>

            <div className={"flex flex-col mt-8 space-y-4 px-2 mb-2 pt-2 overflow-y-auto h-[calc(100vh-270px)]"}>
                {selectedMenu == "Visualización" && <ConfigPanelVisualization dataset={dataset} config={config} setConfig={setConfig}/>}
                {selectedMenu == "Texto" && <ConfigPanelText dataset={dataset} config={config} setConfig={setConfig}/>}
            </div>
        </div>
    </ResizableDiv>
}
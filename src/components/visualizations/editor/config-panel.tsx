import {FilterProps, PlotConfigProps} from "@/lib/types";
import ResizableDiv from "../../../../modules/ui-utils/src/resizable-div";
import {Select} from "../../../../modules/ui-utils/src/select";
import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {TextField} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {FilterConfig} from "./filter-config";
import {Button} from "../../../../modules/ui-utils/src/button";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {PlotSpecificConfig} from "@/components/visualizations/editor/plot-specific-config";


const twoAxis: PropReq[] = [
    {label: "Eje x", type: "column"},
    {label: "Eje y", type: "column"},
]

const twoAxisLabels: PropReq[] = [
    {label: "Etiqueta eje x", type: "string"},
    {label: "Etiqueta eje y", type: "string"}
]

const title: PropReq = {label: "Título", type: "string"}

const orientation: PropReq = {
    label: "Orientación",
    options: ["Horizontal", "Vertical"],
    type: "select",
    defaultValue: "Vertical"
}

const orderBars: PropReq = {
    label: "Ordenar barras",
    options: ["Sí", "No"],
    type: "select",
    defaultValue: "No"
}

type PropReq = {
    label: string
    options?: string[]
    type: "column" | "string" | "select" | "maybe-column"
    defaultValue?: string
}

const oneAxisLabel: PropReq = {
    label: "Etiqueta columna",
    type: "string"
}

const color: PropReq = {
    label: "Color",
    type: "maybe-column",
}

const configReq = new Map<string, PropReq[]>([
    ["Gráfico de barras", [...twoAxis, orientation, orderBars, title, ...twoAxisLabels]],
    ["Gráfico de línea", [...twoAxis, color, title, ...twoAxisLabels]],
    ["Histograma", [
        {
            label: "Columna",
            type: "column",
        },
        title,
        oneAxisLabel
    ]]
])


export function kindToLexicon(kind: string): string {
    const dict = {
        "Histograma": "histogram",
        "Gráfico de línea": "lines",
        "Gráfico de barras": "barplot",
        "Gráfico de puntos": "scatterplot",
        "Hemiciclo": "#hemicycleVisualization"
    }

    return dict[kind];
}


export function lexiconToKind(lexicon: string): string {
    const dict = {
        "histogram": "Histograma",
        "lines": "Gráfico de línea",
        "barplot": "Gráfico de barras",
        "scatterplot": "Gráfico de puntos",
        "#hemicycleVisualization": "Hemiciclo"
    }
    return dict[lexicon];
}



export const ConfigPanel = ({config, setConfig, dataset}: {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
    dataset?: DatasetView | DatasetViewBasic
}) => {

    /*function updateFilter(i: number, value: FilterProps) {
        if(!config.filters){
            updateConfig("filters", [value])
        }
        updateConfig("filters", [...config.filters.slice(0, i), value, ...config.filters.slice(i + 1)])
    }*/

    return <ResizableDiv initialWidth={400} minWidth={240} maxWidth={500} side={"left"}>
        <div className={"rounded-lg p-2 mt-16 w-full bg-[var(--background-dark)]"}>
            <div className={"font-bold text-2xl pt-1 px-2"}>
                Configuración
            </div>
            <div className={"flex flex-col mt-8 space-y-4 px-2 mb-2 pt-2 overflow-y-auto max-h-[calc(100vh-200px)]"}>
                <Select
                    options={["Histograma", "Gráfico de línea", "Gráfico de barras"]}
                    value={config.spec && config.spec.$type ? lexiconToKind(config.spec.$type) : undefined}
                    onChange={(v) => {
                        setConfig({
                            ...config,
                            spec: {
                                ...config.spec,
                                $type: kindToLexicon(v)
                            }
                        })
                    }}
                    label="Tipo de gráfico"
                    fontSize={"14px"}
                    labelShrinkFontSize={"14px"}
                />
                <PlotSpecificConfig config={config}/>
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
            </div>
        </div>
    </ResizableDiv>
}
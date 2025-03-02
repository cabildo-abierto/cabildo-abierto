import {DatasetProps, FilterProps, PlotConfigProps} from "../../../app/lib/definitions";
import ResizableDiv from "../../ui-utils/resizable-div";
import {Select} from "../../ui-utils/select";
import SearchableDropdown from "../../ui-utils/searchable-dropdown";
import {IconButton, TextField} from "@mui/material";
import {BasicButton} from "../../ui-utils/basic-button";
import AddIcon from "@mui/icons-material/Add";
import {FilterConfig} from "./filter-config";
import {PrettyJSON} from "../../utils";
import CodeIcon from '@mui/icons-material/Code';
import {openJsonInNewTab} from "../../content-options/content-options";
import {getSpecForConfig} from "./spec";


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

const configReq = new Map<String, PropReq[]>([
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



export const ConfigPanel = ({config, updateConfig, dataset}: {
    config: PlotConfigProps
    updateConfig: (k: string, v: any) => void
    dataset?: DatasetProps
}) => {

    function updateFilter(i: number, value: FilterProps) {
        if(!config.filters){
            updateConfig("filters", [value])
        }
        updateConfig("filters", [...config.filters.slice(0, i), value, ...config.filters.slice(i + 1)])
    }

    return <ResizableDiv initialWidth={400} minWidth={240} maxWidth={500} side={"left"}>
        <div className={"border rounded-lg p-2 mt-16 w-full"}>
            <div className={"font-bold text-2xl"}>
                Configuración
            </div>
            <hr className={"my-2"}/>
            <div className={"flex flex-col mt-8 space-y-4 px-2 mb-2 pt-2 overflow-y-auto max-h-[calc(100vh-200px)]"}>
                <Select
                    options={["Histograma", "Gráfico de línea", "Gráfico de barras"]}
                    value={config.kind}
                    onChange={(v) => {
                        updateConfig("kind", v)
                    }}
                    label="Tipo de gráfico"
                />
                {config.kind != "Tipo de gráfico" && config.datasetUri != null && dataset != null && <>
                    {configReq.get(config.kind).map((req, i) => {
                        if (req.type == "column") {
                            return <div key={i}>
                                <SearchableDropdown
                                    options={dataset.dataset.columns}
                                    label={req.label}
                                    size={"small"}
                                    selected={config[req.label]}
                                    onChange={(v: string) => {
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
                        } else if (req.type == "select") {
                            return <div key={i}>
                                <Select
                                    label={req.label}
                                    value={config[req.label] ? config[req.label] : req.defaultValue}
                                    options={req.options}
                                    onChange={(v) => {
                                        updateConfig(req.label, v)
                                    }}
                                />
                            </div>
                        } else if (req.type == "maybe-column") {
                            return <div key={i}>
                                <SearchableDropdown
                                    options={["Fijo", ...dataset.dataset.columns]}
                                    label={req.label}
                                    size={"small"}
                                    selected={config[req.label]}
                                    onChange={(v: string) => {
                                        updateConfig(req.label, v)
                                    }}
                                />
                            </div>
                        } else {
                            throw Error("Not implemented.")
                        }
                    })}
                </>}
                {config.filters && config.filters.map((f, i) => {
                    return <div key={i}>
                        <FilterConfig
                            filter={f}
                            config={config}
                            dataset={dataset}
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
                            updateConfig("filters", [...(config.filters ? config.filters : []), {}])
                        }}
                        size={"small"}
                        variant={"text"}
                    >
                        Filtro
                    </BasicButton>
                </div>
                <div className={"flex justify-end"}>
                <IconButton size={"small"}
                    onClick={() => {openJsonInNewTab(getSpecForConfig(config, {dataset}))}}
                >
                    <CodeIcon fontSize={"small"}/>
                </IconButton>
                </div>
            </div>
        </div>
    </ResizableDiv>
}
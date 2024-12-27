"use client"
import {ThreeColumnsLayout} from "../../../components/three-columns";
import {useDatasets} from "../../../hooks/contents";
import LoadingSpinner from "../../../components/loading-spinner";
import {ErrorPage} from "../../../components/error-page";
import {useEffect, useState} from "react";
import {getDataset, saveVisualization} from "../../../actions/data";
import SearchableDropdown from "../../../components/ui-utils/searchable-dropdown";
import {DatasetProps, FilterProps, PlotConfigProps} from "../../lib/definitions";
import {BasicButton} from "../../../components/ui-utils/basic-button";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {IconButton, TextField} from "@mui/material";
import StateButton from "../../../components/state-button";
import {Plot} from "../../../components/visualizations/plot";
import { getSpecForConfig } from "../../../components/visualizations/spec";

function readyToSave(config: PlotConfigProps){
    if(config.kind == null) return false

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

const Page = () => {
    const {datasets, isLoading} = useDatasets()
    const [config, setConfig] = useState<PlotConfigProps>({filters: []})
    const [columns, setColumns] = useState<string[] | null>(null)

    useEffect(() => {
        if(config.dataset != null){
            setColumns(config.dataset.dataset.columns)
        } else {
            setColumns(null)
        }
    }, [config.dataset])

    const updateConfig = (key, value) => {
        setConfig((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    }

    function updateFilter(i: number, value: FilterProps) {
        updateConfig("filters", [...config.filters.slice(0, i), value, ...config.filters.slice(i+1)])
    }

    if(isLoading) return <LoadingSpinner/>
    if(!datasets) return <ErrorPage>Error</ErrorPage>

    const datasetTitles = datasets.map((d) => (d.dataset.title))

    async function onSave(){
        const spec = getSpecForConfig(config)

        const {error} = await saveVisualization(spec)

        return {error}
    }

    const saveDisabled = !readyToSave(config)

    const center = <div className={"px-2 mt-8"}>
        <div className={"text-center"}>
            <h1>Nueva visualización</h1>
        </div>
        <div className={"flex flex-col items-center mt-8 space-y-8"}>
            <div>
                <SearchableDropdown
                    options={datasetTitles}
                    label={"Dataset"}
                    size={"small"}
                    onSelect={(v: string) => {
                        updateConfig("dataset", datasets[datasetTitles.indexOf(v)])
                    }}
                />
            </div>
            <div className={"flex flex-col mt-4"}>
                <SearchableDropdown
                    options={["Histograma", "Gráfico de línea", "Gráfico de barras"]}
                    label={"Tipo de visualización"}
                    size={"small"}
                    onSelect={(v: string) => {
                        updateConfig("kind", v)
                    }}
                />
            </div>
            {config.kind != null && config.dataset != null && <>
                { configReq.get(config.kind).map((req, i) => {
                    if(req.type == "column"){
                        return <div key={i}>
                            <SearchableDropdown
                                options={columns}
                                label={req.label}
                                size={"small"}
                                onSelect={(v: string) => {updateConfig(req.label, v)}}
                            />
                        </div>
                    } else if(req.type == "string") {
                        return <div key={i}>
                            <TextField
                                label={req.label}
                                size={"small"}
                                value={config[req.label]}
                                InputProps={{autoComplete: "off"}}
                                onChange={(e) => {updateConfig(req.label, e.target.value)}}
                            />
                        </div>
                    }{
                        throw Error("Not implemented.")
                    }
                })}
            </>}
            {config.filters && config.filters.map((f, i) => {
                return <div key={i} className={"flex items-center space-x-2"}>
                    <SearchableDropdown
                        options={columns}
                        label={"Columna"}
                        size={"small"}
                        onSelect={(c: string) => {
                            updateFilter(i, {column: c, op: config.filters[i].op, value: config.filters[i].value})
                        }}
                    />
                    <SearchableDropdown
                        options={["igual a", "distinto de"]}
                        label={"Operador"}
                        size={"small"}
                        onSelect={(c: "igual a" | "distinto de") => {
                            updateFilter(i, {
                                op: c,
                                column: config.filters[i].column,
                                value: config.filters[i].value
                            })
                        }}
                    />
                    <TextField
                        label={"Valor"}
                        value={config.filters[i].value}
                        size={"small"}
                        InputProps={{autoComplete: "off"}}
                        onChange={(e) => {
                            updateFilter(i, {
                                value: e.target.value,
                                column: config.filters[i].column,
                                op: config.filters[i].op
                            })
                        }}
                    />
                    <IconButton
                        size={"small"}
                        onClick={() => {
                            updateConfig("filters", [...config.filters.slice(0, i), ...config.filters.slice(i + 1)])
                        }}
                    >
                        <RemoveIcon/>
                    </IconButton>
                </div>
            })}
            <div>
                <BasicButton
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
            <div>
                {
                    config.dataset != null && config.kind != null &&
                    <>
                        <Plot config={config}/>
                    </>
                }
            </div>
            <div>
                {config.dataset != null && <div className={"flex justify-end my-4"}>
                    <StateButton
                        handleClick={onSave}
                        text1={"Guardar"}
                        disabled={saveDisabled}
                    />
                </div>}
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default Page
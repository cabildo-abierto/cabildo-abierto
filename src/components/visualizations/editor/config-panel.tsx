import {DatasetProps, FilterProps, PlotConfigProps} from "../../../app/lib/definitions";
import ResizableDiv from "../../ui-utils/resizable-div";
import {Select} from "../../ui-utils/select";
import SearchableDropdown from "../../ui-utils/searchable-dropdown";
import {TextField} from "@mui/material";
import {BasicButton} from "../../ui-utils/basic-button";
import AddIcon from "@mui/icons-material/Add";
import {FilterConfig} from "./filter-config";
import {PrettyJSON} from "../../utils";


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



export const ConfigPanel = ({config, updateConfig, dataset}: {
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
                {config.kind != "Tipo de gráfico" && config.datasetUri != null && dataset != null && <>
                    {configReq.get(config.kind).map((req, i) => {
                        if (req.type == "column") {
                            return <div key={i}>
                                <SearchableDropdown
                                    options={dataset.dataset.dataset.columns}
                                    label={req.label}
                                    size={"small"}
                                    selected={config[req.label]}
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
import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {produce} from "immer";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {PlotConfigProps} from "@/lib/types";
import {useState} from "react";
import {Switch} from "@mui/material";
import {ListEditor} from "../../../../modules/ui-utils/src/list-editor";

type Props = {
    config: PlotConfigProps
    setConfig: (c: PlotConfigProps) => void
    columnOptions: string[]
}

export const TwoAxisPlotConfig = ({config, setConfig, columnOptions}: Props) => {
    const [multipleYAxis, setMultipleYAxis] = useState(ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(config.spec) && config.spec.yAxes && config.spec.yAxes.length > 0)

    if (!ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(config.spec)) {
        return null
    }

    return <div className={"flex flex-col space-y-4 w-full"}>
        <SearchableDropdown
            options={columnOptions}
            label={"Eje x"}
            size={"small"}
            selected={config.spec.xAxis ?? ""}
            onChange={(v: string) => {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec)) {
                        draft.spec.xAxis = v
                    }
                }))
            }}
        />
        {!multipleYAxis && <SearchableDropdown
            options={columnOptions}
            label={"Eje y"}
            size={"small"}
            selected={config.spec.yAxis ?? ""}
            onChange={(v: string) => {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec)) {
                        draft.spec.yAxis = v
                    }
                }))
            }}
        />}
        {multipleYAxis && <div className={"text-sm space-y-1"}>
            <div className={"text-[var(--text-light)]"}>
                Columnas para el eje y
            </div>
            <ListEditor
                items={config.spec.yAxes ? config.spec.yAxes.map(c => c.column) : []}
                setItems={(yCols: string[]) => {
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec)) {
                            draft.spec.yAxes = yCols.map(c => ({
                                $type: "ar.cabildoabierto.embed.visualization#axisConfig",
                                column: c
                            }))
                            draft.spec.yAxis = undefined
                        }
                    }))
                }}
                options={columnOptions}
            />
        </div>}
        <SearchableDropdown
            options={columnOptions}
            label={"Color"}
            size={"small"}
            selected={config.spec.colors && config.spec.colors.length > 0 ? config.spec.colors[0].column : ""}
            onChange={(v: string) => {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec)) {
                        if(v.trim().length == 0){
                            draft.spec.colors = undefined
                        } else {
                            draft.spec.colors = [{
                                $type: "ar.cabildoabierto.embed.visualization#axisConfig",
                                column: v
                            }]
                        }
                    }
                }))
            }}
        />
        <div className={"flex items-center space-x-2 px-1"}>
            <div className={"text-sm text-[var(--text-light)]"}>
                Eje y múltiple
            </div>
            <Switch
                size={"small"}
                value={multipleYAxis}
                defaultChecked={multipleYAxis}
                onChange={(e, v) => {
                    setMultipleYAxis(v)
                    setConfig(produce(config, draft => {
                        if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec)) {
                            draft.spec.yAxes = undefined
                            draft.spec.yAxis = undefined
                        }
                    }))
                }}
            />
        </div>
    </div>
}
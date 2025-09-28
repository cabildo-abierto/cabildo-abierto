import {DeepPartial, PlotConfigProps} from "@/lib/types";
import {Select} from "../../../../modules/ui-utils/src/select";
import {PlotSpecificConfig} from "@/components/visualizations/editor/plot-specific-config";
import {produce} from "immer";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import { TextField } from "../../../../modules/ui-utils/src/text-field";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {ConfigPanelDimensions} from "@/components/visualizations/editor/config-panel-dimensions";
import VisualizationIcon from "@/components/layout/icons/visualization-icon";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import {feedOptionNodes} from "@/components/config/feed-option-nodes";

export function kindToLexicon(kind: string): ArCabildoabiertoEmbedVisualization.Main["spec"] {
    if(kind == "Histograma") {
        return {
            $type: "ar.cabildoabierto.embed.visualization#oneAxisPlot",
            plot: {
                "$type": "ar.cabildoabierto.embed.visualization#histogram"
            }
        }
    } else if(kind == "Gráfico de línea") {
        return {
            $type: "ar.cabildoabierto.embed.visualization#twoAxisPlot",
            plot: {
                "$type": "ar.cabildoabierto.embed.visualization#lines"
            }
        }
    } else if(kind == "Gráfico de barras") {
        return {
            $type: "ar.cabildoabierto.embed.visualization#twoAxisPlot",
            plot: {
                "$type": "ar.cabildoabierto.embed.visualization#barplot"
            }
        }
    } else if(kind == "Gráfico de dispersión") {
        return {
            $type: "ar.cabildoabierto.embed.visualization#twoAxisPlot",
            plot: {
                "$type": "ar.cabildoabierto.embed.visualization#scatterplot"
            }
        }
    } else if(kind == "Hemiciclo") {
        return {
            $type: "ar.cabildoabierto.embed.visualization#hemicycle"
        }
    } else if(kind == "Tabla") {
        return {
            $type: "ar.cabildoabierto.embed.visualization#table"
        }
    } else if(kind == "Elección"){
        return {
            $type: "ar.cabildoabierto.embed.visualization#eleccion"
        }
    }
}


function getLexiconHash(l?: string){
    if (!l || !l.includes("#")) return ""
    return l.split("#")[1]
}


export function lexiconToKind(lexicon: DeepPartial<ArCabildoabiertoEmbedVisualization.Main["spec"]>): string {
    const dict = {
        "histogram": "Histograma",
        "lines": "Gráfico de línea",
        "barplot": "Gráfico de barras",
        "scatterplot": "Gráfico de dispersión",
        "hemicycleVisualization": "Hemiciclo",
        "table": "Tabla",
        "eleccion": "Elección"
    }
    if(ArCabildoabiertoEmbedVisualization.isOneAxisPlot(lexicon)) {
        return "Histograma"
    } else if(ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(lexicon)) {
        return dict[getLexiconHash(lexicon.plot.$type)]
    } else {
        return dict[getLexiconHash(lexicon.$type)]
    }
}


const ConfigPanelText = ({config, setConfig}: { config: PlotConfigProps, setConfig: (v: PlotConfigProps) => void }) => {
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
            fontSize={"0.875rem"}
        />
        <TextField
            label={"Epígrafe"}
            multiline
            size={"small"}
            paddingX={"12px"}
            value={config.caption ?? ""}
            onChange={e => {
                setConfig(produce(config, draft => {
                    draft.caption = e.target.value
                }))
            }}
            fontSize={"0.875rem"}
        />
        {(ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(config.spec) || ArCabildoabiertoEmbedVisualization.isOneAxisPlot(config.spec)) && <TextField
            label={"Etiqueta eje x"}
            size={"small"}
            value={config.spec.xLabel ?? config.spec.xAxis}
            onChange={e => {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec) || ArCabildoabiertoEmbedVisualization.isOneAxisPlot(draft.spec)) {
                        draft.spec.xLabel = e.target.value
                    }
                }))
            }}
            fontSize={"0.875rem"}
        />}
        {ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(config.spec) && <TextField
            label={"Etiqueta eje y"}
            size={"small"}
            value={config.spec.yLabel ?? (config.spec.yAxis ?? "")}
            onChange={e => {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(draft.spec)) {
                        draft.spec.yLabel = e.target.value
                    }
                }))
            }}
            fontSize={"0.875rem"}
        />}
    </>
}


const ConfigPanelVisualization = ({config, setConfig}: {
    config: PlotConfigProps,
    setConfig: (v: PlotConfigProps) => void
}) => {
    return <>
        <Select
            options={[
                "Histograma",
                "Gráfico de línea",
                "Gráfico de barras",
                "Gráfico de dispersión",
                "Tabla",
                "Elección"
            ]}
            value={config.spec && config.spec.$type ? lexiconToKind(config.spec) : ""}
            onChange={(v) => {
                setConfig(produce(config, draft => {
                    if (!draft.spec) draft.spec = {}
                    draft.spec = kindToLexicon(v)
                }))
            }}
            label="Tipo de gráfico"
            fontSize={"14px"}
            labelShrinkFontSize={"14px"}
        />
        <PlotSpecificConfig
            config={config}
            setConfig={setConfig}
        />
    </>
}


export const ConfigPanel = ({config, setConfig}: {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}) => {
    const [selectedMenu, setSelectedMenu] = useState<string>("Visualización")

    function optionLabels(o: string) {
        if(o == "Visualización"){
            return <VisualizationIcon fontSize={"small"}/>
        } else if(o == "Texto"){
            return <TextFieldsIcon fontSize={"small"}/>
        } else if(o == "Dimensiones"){
            return <SquareFootIcon fontSize={"small"}/>
        }
    }

    return <>
        <div className={"flex border-b border-[var(--accent-dark)] w-full mt-2"}>
            <SelectionComponent
                options={["Visualización", "Texto", "Dimensiones"]}
                optionsNodes={feedOptionNodes(40, undefined, undefined, "background-dark", optionLabels)}
                selected={selectedMenu}
                onSelection={(v: string) => {
                    setSelectedMenu(v)
                }}
                className={"flex justify-center"}
            />
        </div>

        <div className={"flex flex-col justify-between mt-2 space-y-4 px-2 mb-2 pt-2 custom-scrollbar overflow-y-scroll h-full"}>
            <div className={"flex flex-col space-y-4"}>
                {selectedMenu == "Visualización" && <ConfigPanelVisualization config={config} setConfig={setConfig}/>}
                {selectedMenu == "Texto" && <ConfigPanelText config={config} setConfig={setConfig}/>}
                {selectedMenu == "Dimensiones" && <ConfigPanelDimensions config={config} setConfig={setConfig}/>}
            </div>

            <div className={"p-2 text-[var(--text-light)] text-sm font-light"}>
                El editor de visualizaciones está en fase experimental. Si ves algo raro o querés que le agreguemos una funcionalidad, escribinos.
            </div>
        </div>
    </>
}
import {DeepPartial, PlotConfigProps} from "@/lib/types";
import {Select} from "../../../../modules/ui-utils/src/select";
import {PlotSpecificConfig} from "@/components/visualizations/editor/plot-specific-config";
import {produce} from "immer";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {ReactNode, useState} from "react";
import {Button} from "../../../../modules/ui-utils/src/button";
import {isOneAxisPlot, isTwoAxisPlot} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import { TextField } from "../../../../modules/ui-utils/src/text-field";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {SliderWithInput} from "../../../../modules/ui-utils/src/slider-with-input";
import {ConfigPanelDimensions} from "@/components/visualizations/editor/config-panel-dimensions";
import VisualizationIcon from "@/components/icons/visualization-icon";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

export function kindToLexicon(kind: string): Visualization["spec"] {
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
    }
}


function getLexiconHash(l?: string){
    if (!l || !l.includes("#")) return ""
    return l.split("#")[1]
}


export function lexiconToKind(lexicon: DeepPartial<Visualization["spec"]>): string {
    const dict = {
        "histogram": "Histograma",
        "lines": "Gráfico de línea",
        "barplot": "Gráfico de barras",
        "scatterplot": "Gráfico de dispersión",
        "hemicycleVisualization": "Hemiciclo",
        "table": "Tabla"
    }
    if(isOneAxisPlot(lexicon)) {
        return "Histograma"
    } else if(isTwoAxisPlot(lexicon)) {
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
            value={config.caption ?? ""}
            onChange={e => {
                setConfig(produce(config, draft => {
                    draft.caption = e.target.value
                }))
            }}
            fontSize={"0.875rem"}
        />
        {(isTwoAxisPlot(config.spec) || isOneAxisPlot(config.spec)) && <TextField
            label={"Etiqueta eje x"}
            size={"small"}
            value={config.spec.xLabel ?? config.spec.xAxis}
            onChange={e => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        draft.spec.xLabel = e.target.value
                    }
                }))
            }}
            fontSize={"0.875rem"}
        />}
        {isTwoAxisPlot(config.spec) && <TextField
            label={"Etiqueta eje y"}
            size={"small"}
            value={config.spec.yLabel ?? config.spec.yAxis}
            onChange={e => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
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
            options={["Histograma", "Gráfico de línea", "Gráfico de barras", "Gráfico de dispersión", "Tabla"]}
            value={config.spec && config.spec.$type ? lexiconToKind(config.spec) : ""}
            onChange={(v) => {
                setConfig(produce(config, draft => {
                    if (!draft.spec) draft.spec = {}
                    draft.spec = {
                        ...draft.spec,
                        ...kindToLexicon(v)
                    }
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


export const ConfigPanel = ({config, setConfig}: {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}) => {
    const [selectedMenu, setSelectedMenu] = useState<string>("Visualización")

    function optionsNodes(o: string, isSelected: boolean) {
        let icon: ReactNode
        if(o == "Visualización"){
            icon = <VisualizationIcon fontSize={"small"}/>
        } else if(o == "Texto"){
            icon = <TextFieldsIcon fontSize={"small"}/>
        } else if(o == "Dimensiones"){
            icon = <SquareFootIcon fontSize={"small"}/>
        }
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
                    {icon}
                </div>
            </Button>
        </div>
    }

    return <>
        <div className={"flex border-b w-full mt-2"}>
            <SelectionComponent
                options={["Visualización", "Texto", "Dimensiones"]}
                optionsNodes={optionsNodes}
                selected={selectedMenu}
                onSelection={(v: string) => {
                    setSelectedMenu(v)
                }}
                className={"flex justify-center"}
            />
        </div>

        <div className={"flex flex-col mt-2 space-y-4 px-2 mb-2 pt-2 overflow-y-scroll h-full"}>
            {selectedMenu == "Visualización" && <ConfigPanelVisualization config={config} setConfig={setConfig}/>}
            {selectedMenu == "Texto" && <ConfigPanelText config={config} setConfig={setConfig}/>}
            {selectedMenu == "Dimensiones" && <ConfigPanelDimensions config={config} setConfig={setConfig}/>}
        </div>
    </>
}
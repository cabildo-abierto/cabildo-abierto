import {PlotConfigProps} from "@/lib/types";
import {isOneAxisPlot, isTable, isTwoAxisPlot} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {SliderWithInput} from "../../../../modules/ui-utils/src/slider-with-input";
import {produce} from "immer";
import {ReactNode} from "react";


export const ConfigPanelDimensions = ({config, setConfig}: { config: PlotConfigProps, setConfig: (v: PlotConfigProps) => void }) => {
    const inputs: ReactNode[] = []

    if(isTwoAxisPlot(config.spec) || isOneAxisPlot(config.spec)) {
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.xLabelOffset ?? 0}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.xLabelOffset = v
                    }
                }))
            }}
            max={100}
            label={"Separación de la etiqueta del eje x"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.yLabelOffset ?? 0}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.yLabelOffset = v
                    }
                }))
            }}
            max={60}
            label={"Separación de la etiqueta del eje y"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.xTickLabelsAngle ?? 0}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.xTickLabelsAngle = v
                    }
                }))
            }}
            max={90}
            label={"Ángulo de las etiquetas del eje x"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.xLabelFontSize ?? 12}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.xLabelFontSize = v
                    }
                }))
            }}
            max={30}
            min={4}
            label={"Fuente del título del eje x"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.yLabelFontSize ?? 12}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.yLabelFontSize = v
                    }
                }))
            }}
            max={30}
            min={4}
            label={"Fuente del título del eje y"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.xTickLabelsFontSize ?? 10}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.xTickLabelsFontSize = v
                    }
                }))
            }}
            max={30}
            min={4}
            label={"Fuente de los ticks del eje x"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.yTickLabelsFontSize ?? 10}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.yTickLabelsFontSize = v
                    }
                }))
            }}
            max={30}
            min={4}
            label={"Fuente de los ticks del eje y"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.marginBottom ?? 55}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.marginBottom = v
                    }
                }))
            }}
            max={150}
            min={0}
            label={"Margen del eje x"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.marginLeft ?? 55}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.marginLeft = v
                    }
                }))
            }}
            max={150}
            min={0}
            label={"Margen del eje y"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.xAxisPrecision ?? 2}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.xAxisPrecision = v
                    }
                }))
            }}
            max={10}
            min={0}
            label={"Precisión del eje x"}
        />)
        inputs.push(<SliderWithInput
            value={config.spec.dimensions?.yAxisPrecision ?? 2}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec) || isOneAxisPlot(draft.spec)) {
                        if(!draft.spec.dimensions) draft.spec.dimensions = {}
                        draft.spec.dimensions.yAxisPrecision = v
                    }
                }))
            }}
            max={10}
            min={0}
            label={"Precisión del eje y"}
        />)
    }

    if(!isTable(config.spec)){
        inputs.push(<SliderWithInput
            value={parseFloat(config.aspectRatio ?? "1.33")}
            onChange={v => {
                setConfig(produce(config, draft => {
                    draft.aspectRatio = v.toString()
                }))
            }}
            max={4}
            min={0.25}
            step={0.01}
            label={"Relación de aspecto"}
        />)
    }

    return <>
        {inputs.map((i, index) => <div key={index}>
            {i}
        </div>)}
    </>
}
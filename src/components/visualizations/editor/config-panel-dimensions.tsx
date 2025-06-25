import {PlotConfigProps} from "@/lib/types";
import {isTwoAxisPlot} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {SliderWithInput} from "../../../../modules/ui-utils/src/slider-with-input";
import {produce} from "immer";


export const ConfigPanelDimensions = ({config, setConfig}: { config: PlotConfigProps, setConfig: (v: PlotConfigProps) => void }) => {
    return <>
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.xLabelOffset ?? 0}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.xLabelOffset = v
                    }
                }))
            }}
            max={60}
            label={"Separación de la etiqueta del eje x"}
        />}
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.yLabelOffset ?? 0}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.yLabelOffset = v
                    }
                }))
            }}
            max={60}
            label={"Separación de la etiqueta del eje y"}
        />}
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.xTickLabelsAngle ?? 0}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.xTickLabelsAngle = v
                    }
                }))
            }}
            max={90}
            label={"Ángulo de las etiquetas del eje x"}
        />}
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.xLabelFontSize ?? 12}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.xLabelFontSize = v
                    }
                }))
            }}
            max={30}
            min={4}
            label={"Fuente del título del eje x"}
        />}
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.yLabelFontSize ?? 12}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.yLabelFontSize = v
                    }
                }))
            }}
            max={30}
            min={4}
            label={"Fuente del título del eje y"}
        />}
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.marginBottom ?? 55}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.marginBottom = v
                    }
                }))
            }}
            max={100}
            min={0}
            label={"Margen del eje x"}
        />}
        {isTwoAxisPlot(config.spec) && <SliderWithInput
            value={config.spec.dimensions.marginLeft ?? 55}
            onChange={v => {
                setConfig(produce(config, draft => {
                    if (isTwoAxisPlot(draft.spec)) {
                        draft.spec.dimensions.marginLeft = v
                    }
                }))
            }}
            max={100}
            min={0}
            label={"Margen del eje y"}
        />}
        <SliderWithInput
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
        />
    </>
}
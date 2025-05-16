import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {PlotConfigProps} from "@/lib/types";
import {
    Lines,
    Barplot,
    Scatterplot,
    isHistogram, isHemicycleVisualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {$Typed} from "@atproto/api";
import {produce} from "immer";

type PlotSpecificConfigProps = {
    dataset?: DatasetView | DatasetViewBasic
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}

export function isTwoAxisPlot(content: any): content is $Typed<Lines> | $Typed<Scatterplot> | $Typed<Barplot> {
    return content?.$type === 'ar.cabildoabierto.embed.visualization#lines' ||
        content?.$type === 'ar.cabildoabierto.embed.visualization#barplot' ||
        content?.$type === 'ar.cabildoabierto.embed.visualization#scatterplot';
}

export const PlotSpecificConfig = ({config, setConfig, dataset}: PlotSpecificConfigProps) => {
    if(!config.spec || !config.spec.$type) return null

    if(isTwoAxisPlot(config.spec)){
        return <div className={"flex flex-col space-y-4"}>
            <SearchableDropdown
                options={dataset ? dataset.columns.map(c => c.name) : []}
                label={"Eje x"}
                size={"small"}
                selected={config.spec.xlabel ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(isTwoAxisPlot(draft.spec)){
                            draft.spec.xlabel = v
                        }
                    }))
                }}
            />
            <SearchableDropdown
                options={dataset ? dataset.columns.map(c => c.name) : []}
                label={"Eje y"}
                size={"small"}
                selected={config.spec.ylabel ??  ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(isTwoAxisPlot(draft.spec)){
                            draft.spec.ylabel = v
                        }
                    }))
                }}
            />
        </div>
    }
    if(isHistogram(config.spec)) {
        return <div>
            <SearchableDropdown
                options={dataset ? dataset.columns.map(c => c.name) : []}
                label={"Eje x"}
                size={"small"}
                selected={config.spec.xlabel ?? ""}
                onChange={(v: string) => {
                    setConfig(produce(config, draft => {
                        if(isHistogram(draft.spec)){
                            draft.spec.xlabel = v
                        }
                    }))
                }}
            />
        </div>
    } else if(isHemicycleVisualization(config.spec)){
        return <div>
            Sin implementar
        </div>
    }
}

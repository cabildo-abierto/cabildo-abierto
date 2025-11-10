import {PlotConfigProps} from "@/lib/types";
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {useDataset} from "@/queries/getters/useDataset";
import LoadingSpinner from "../../layout/base/loading-spinner";
import {Column} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {produce} from "immer";
import {BaseTextField} from "../../layout/base/base-text-field";
import {useEffect} from "react";
import {Switch} from "@/components/ui/switch";

type TableVisualizationConfigProps = {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}

export const TableVisualizationConfig = ({config, setConfig}: TableVisualizationConfigProps) => {
    const {
        data,
        isLoading: loadingTopicsDataset
    } = useTopicsDataset(ArCabildoabiertoEmbedVisualization.isTopicsDataSource(config.dataSource) ? config.filters : null, true)
    const {
        data: dataset,
        isLoading: loadingDataset
    } = useDataset(ArCabildoabiertoEmbedVisualization.isDatasetDataSource(config.dataSource) ? config.dataSource.dataset : null)

    let columns: Column[] = data && data.data ? data.data.columns : (dataset ? dataset.columns : null)

    useEffect(() => {
        if (ArCabildoabiertoEmbedVisualization.isTable(config.spec) && config.spec.columns == null && columns) {
            setConfig(produce(config, draft => {
                if (ArCabildoabiertoEmbedVisualization.isTable(draft.spec)) {
                    draft.spec.columns = columns.map(c => ({
                        $type: "ar.cabildoabierto.embed.visualization#tableVisualizationColumn",
                        columnName: c.name,
                        alias: c.name
                    }))
                }
            }))
        }
    }, [config, data, setConfig, columns])

    if (loadingTopicsDataset || loadingDataset) {
        return <div>
            <LoadingSpinner/>
        </div>
    }

    if (!columns) {
        return null
    }

    if (!ArCabildoabiertoEmbedVisualization.isTable(config.spec)) {
        return null
    }

    function setShowColumn(c: string, v: boolean, alias?: string) {
        setConfig(produce(config, draft => {
            if (ArCabildoabiertoEmbedVisualization.isTable(draft.spec) && draft.spec.columns) {
                if (v) {
                    const index = draft.spec.columns.findIndex(c2 => c2.columnName == c)
                    if (index == -1) {
                        draft.spec.columns.push({
                            $type: "ar.cabildoabierto.embed.visualization#tableVisualizationColumn",
                            columnName: c,
                            alias
                        })
                    } else {
                        draft.spec.columns[index] = {
                            $type: "ar.cabildoabierto.embed.visualization#tableVisualizationColumn",
                            columnName: c,
                            alias
                        }
                    }
                } else {
                    const index = draft.spec.columns.findIndex(c2 => c2.columnName == c)
                    if (index != -1) {
                        draft.spec.columns.splice(index, 1)
                    }
                }
            }
        }))
    }

    return <div className={"px-1 space-y-1"}>
        <div className={"grid grid-cols-[2fr_2fr_1fr] gap-2"}>
            <div className={"text-[var(--text-light)] text-sm"}>
                Columna
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                Nombre
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                ¿Mostrar?
            </div>
        </div>

        {columns.map((c, i) => {
            if (!ArCabildoabiertoEmbedVisualization.isTable(config.spec)) return null
            let value: boolean = true
            if (config.spec.columns && config.spec.columns.length > 0) {
                if (!config.spec.columns.some(colConfig => colConfig.columnName == c.name)) {
                    value = false
                }
            } else {
                value = false
            }
            const configIndex = config.spec.columns ? config.spec.columns.findIndex(colConfig => colConfig.columnName == c.name) : -1

            return <div key={i} className={"grid grid-cols-[2fr_2fr_1fr] gap-2"}>
                <div key={`${i}:1`} className={"text-sm h-7 flex-1 truncate"}>
                    {c.name}
                </div>
                {value ? <div className={"flex-1 h-7"} key={`${i}:2`}>
                    <BaseTextField
                        size={"small"}
                        placeholder={"alias"}
                        value={configIndex != -1 && config.spec.columns[configIndex].alias != null ? config.spec.columns[configIndex].alias : config.spec.columns[configIndex].columnName}
                        onChange={e => setShowColumn(c.name, true, e.target.value)}
                    />
                </div> : <div key={`${i}:2`}/>}
                <div
                    className={"h-7"}
                    key={`${i}:3`}
                >
                    <Switch
                        checked={value}
                        onCheckedChange={e => {
                            setShowColumn(c.name, e)
                        }}
                    />
                </div>
            </div>
        })}
    </div>
}
import {PlotConfigProps} from "@/lib/types";
import {useTopicsDataset} from "@/components/visualizations/editor/visualization-editor";
import {isDatasetDataSource, isTable, isTopicsDataSource} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {useDataset} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {Column} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {Switch} from "@mui/material";
import {produce} from "immer";
import {TextField} from "../../../../modules/ui-utils/src/text-field";
import {useEffect} from "react";

type TableVisualizationConfigProps = {
    config: PlotConfigProps
    setConfig: (config: PlotConfigProps) => void
}

export const TableVisualizationConfig = ({config, setConfig}: TableVisualizationConfigProps) => {
    const {
        data,
        isLoading: loadingTopicsDataset
    } = useTopicsDataset(isTopicsDataSource(config.dataSource) ? config.filters : null, true)
    const {
        data: dataset,
        isLoading: loadingDataset
    } = useDataset(isDatasetDataSource(config.dataSource) ? config.dataSource.dataset : null)

    let columns: Column[] = data && data.data ? data.data.columns : (dataset ? dataset.columns : null)

    useEffect(() => {
        if(isTable(config.spec) && config.spec.columns == null){
            setConfig(produce(config, draft => {
                if(isTable(draft.spec)){
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
        return <div className={"text-center text-sm text-[var(--text-light)] py-8"}>
            Ocurrió un error al cargar los datos
        </div>
    }

    if (!isTable(config.spec)) {
        return null
    }

    function setShowColumn(c: string, v: boolean, alias?: string) {
        setConfig(produce(config, draft => {
            if (isTable(draft.spec) && draft.spec.columns) {
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

    return <div className={"space-y-1"}>
        <div className={"text-[var(--text-light)] text-sm"}>
            Columnas
        </div>
        <div className={"space-y-2"}>
            {columns.map((c, i) => {
                if (!isTable(config.spec)) return null
                let value: boolean = true
                if (config.spec.columns && config.spec.columns.length > 0) {
                    if (!config.spec.columns.some(colConfig => colConfig.columnName == c.name)) {
                        value = false
                    }
                } else {
                    value = false
                }
                const configIndex = config.spec.columns ? config.spec.columns.findIndex(colConfig => colConfig.columnName == c.name) : -1

                return <div key={i} className={"flex justify-between space-x-2 items-center"}>
                    <div className={"text-sm flex-1"}>
                        {c.name}
                    </div>
                    {value && <div className={"flex-1"}>
                        <TextField
                            dense={true}
                            label={"Alias"}
                            fontSize={"12px"}
                            size={"small"}
                            value={configIndex != -1 && config.spec.columns[configIndex].alias ? config.spec.columns[configIndex].columnName : c.name}
                            onChange={e => setShowColumn(c.name, true, e.target.value)}
                        />
                    </div>}
                    <div>
                        <Switch
                            size={"small"}
                            checked={value}
                            onChange={e => {
                                setShowColumn(c.name, e.target.checked)
                            }}
                        />
                    </div>
                </div>
            })}
        </div>
    </div>
}
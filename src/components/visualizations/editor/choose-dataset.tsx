import {PlotConfigProps} from "@/lib/types";
import {useEffect, useState} from "react";
import {DatasetPreviewOnEditor} from "@/components/visualizations/datasets/dataset-preview-on-editor";
import LoadingSpinner from "../../layout/base/loading-spinner";
import {cleanText} from "@/utils/strings";
import {BaseButton} from "../../layout/base/baseButton";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import SearchBar from "@/components/buscar/search-bar";
import {produce} from "immer";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import TopicsIcon from "@/components/layout/icons/topics-icon";
import {TopicsDataSourceConfig} from "@/components/visualizations/editor/topics-data-source-config";
import SelectionComponent from "@/components/buscar/search-selection-component";
import DatasetIcon from "@/components/layout/icons/dataset-icon";
import {ArrowsClockwiseIcon, FunnelIcon, PlusIcon} from "@phosphor-icons/react";
import {FilterConfig} from "@/components/visualizations/editor/filter-config";
import StateButton, {StateButtonClickHandler} from "../../layout/utils/state-button";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";
import {Note} from "@/components/layout/utils/note";


const DatasetsSearch = ({datasets, config, setConfig}: {
    config: PlotConfigProps, setConfig: (v: PlotConfigProps) => void, datasets: DatasetViewBasic[]
}) => {
    const [searchValue, setSearchValue] = useState<string>("")
    const [filteredDatasets, setFilteredDatasets] = useState<DatasetViewBasic[]>(datasets)

    useEffect(() => {
        const v = cleanText(searchValue)
        const f = datasets ? datasets.filter((d) => {
            if (v.length == 0) return true
            return cleanText(d.name).includes(v)
        }) : undefined

        setFilteredDatasets(f)
    }, [searchValue, datasets])

    return <>
        <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            placeholder={"Buscar"}
        />
        <div className={"space-y-1 mt-2 overflow-y-auto custom-scrollbar h-[calc(100vh-250px)]"}>
            {filteredDatasets ? filteredDatasets.map((d, i) => {
                    return <div key={i} className={""}>
                        <DatasetPreviewOnEditor
                            dataset={d}
                            selected={config.dataSource && ArCabildoabiertoEmbedVisualization.isDatasetDataSource(config.dataSource) && config.dataSource.dataset == d.uri}
                            onClick={() => {
                                setConfig(produce(config, draft => {
                                    draft.dataSource = {
                                        $type: "ar.cabildoabierto.embed.visualization#datasetDataSource",
                                        dataset: d.uri
                                    }
                                    draft.filters = undefined
                                    draft.spec = undefined
                                }))
                            }}
                        />
                    </div>
                }) :
                <div className={"mt-8"}>
                    <LoadingSpinner/>
                </div>}
        </div>
    </>
}


const ChooseDatasetPanelDatasetSelection = ({
                                                config,
                                                setConfig,
                                                onNewDataset,
                                                setSelectedMenu,
                                                datasets,
                                                creatingNewDataset
                                            }: {
    config: PlotConfigProps
    setConfig: (c: PlotConfigProps) => void
    onNewDataset: () => void
    setSelectedMenu: (v: "Conjuntos de datos" | "Filtros") => void
    datasets?: DatasetViewBasic[]
    creatingNewDataset: boolean
}) => {

    const creatingTopicsBased = ArCabildoabiertoEmbedVisualization.isTopicsDataSource(config.dataSource)
    return <>
        <div className={"flex space-x-1 px-2"}>
            <BaseButton
                startIcon={<TopicsIcon/>}
                className={creatingTopicsBased ? "bg-[var(--background-dark2)] group-[.portal]:hover:bg-[var(--background-dark3)] " : ""}
                size={"small"}
                onClick={() => {
                    setConfig(produce(config, draft => {
                        if (!draft.dataSource) draft.dataSource = {}
                        if (creatingTopicsBased) {
                            draft.dataSource = {
                                $type: "ar.cabildoabierto.embed.visualization#datasetDataSource"
                            }
                        } else {
                            draft.dataSource = {
                                $type: "ar.cabildoabierto.embed.visualization#topicsDataSource"
                            }
                        }
                    }))
                }}
            >
                Usar temas
            </BaseButton>
            <BaseButton
                startIcon={<PlusIcon fontSize={18}/>}
                className={creatingNewDataset ? "bg-[var(--background-dark2)] group-[.portal]:hover:bg-[var(--background-dark3)] " : ""}
                size={"small"}
                onClick={() => {
                    onNewDataset()
                }}
            >
                Conjunto de datos
            </BaseButton>
        </div>
        <div className={"px-2 pb-2"}>
            {!creatingTopicsBased && <DatasetsSearch
                datasets={datasets}
                setConfig={setConfig}
                config={config}
            />}
            {creatingTopicsBased && <TopicsDataSourceConfig
                onGoToFilters={() => {
                    setSelectedMenu("Filtros")
                }}
            />}
        </div>
    </>
}


export const ChooseDatasetPanelFiltersConfig = ({
                                                    config,
                                                    setConfig,
                                                    setSelectedMenu,
                                                    datasets,
                                                    onReloadData,
                                                    onNewDataset
                                                }: {
    config: PlotConfigProps
    setConfig?: (c: PlotConfigProps) => void
    setSelectedMenu?: (v: "Conjuntos de datos" | "Filtros") => void
    datasets?: DatasetViewBasic[]
    onReloadData?: StateButtonClickHandler
    onNewDataset?: () => void
}) => {
    function onAddFilter() {
        setConfig(produce(config, draft => {
            if (!draft.filters) draft.filters = []

            draft.filters.push({
                "$type": "ar.cabildoabierto.embed.visualization#columnFilter"
            })
        }))
    }

    function onRemoveFilter(i: number) {
        setConfig(produce(config, draft => {
            draft.filters.splice(i, 1)
        }))
    }

    if (!config.dataSource || !config.dataSource.$type) {
        return <Note className={"p-4"}>
            Elegí una fuente de datos primero.
        </Note>
    }

    const datasetUri = ArCabildoabiertoEmbedVisualization.isDatasetDataSource(config.dataSource) ? config.dataSource.dataset : undefined
    const dataset = datasetUri ? datasets.find(d => d.uri == datasetUri) : undefined

    return <div className={"flex flex-col justify-between h-full pb-2 px-2"}>
        <div className={"flex flex-col items-start space-y-4"}>
            {(config.filters ?? []).map((d, i) => {
                return <div key={i} className={"mt-4"}>
                    <FilterConfig
                        config={config}
                        setConfig={setConfig}
                        index={i}
                        onRemove={() => {
                            onRemoveFilter(i)
                        }}
                        dataset={dataset}
                    />
                </div>
            })}
            {setConfig &&
            <BaseButton
                startIcon={<PlusIcon/>}
                size={"small"}
                onClick={onAddFilter}
            >
                Agregar filtro
            </BaseButton>}
        </div>

        {onReloadData && <div className={"flex justify-end w-full"}>
            <StateButton
                startIcon={<ArrowsClockwiseIcon/>}
                size={"small"}
                handleClick={onReloadData}
            >
                Cargar datos
            </StateButton>
        </div>}
    </div>
}


export const ChooseDatasetPanel = ({datasets, creatingNewDataset, config, setConfig, onReloadData, onNewDataset}: {
    datasets?: DatasetViewBasic[],
    config: PlotConfigProps,
    setConfig: (config: PlotConfigProps) => void
    onReloadData?: StateButtonClickHandler
    onNewDataset: () => void
    creatingNewDataset: boolean
}) => {
    const [selectedMenu, setSelectedMenu] = useState<"Conjuntos de datos" | "Filtros">("Conjuntos de datos")

    useEffect(() => {
        if (config.dataSource && ArCabildoabiertoEmbedVisualization.isDatasetDataSource(config.dataSource) && config.dataSource.dataset && datasets) {
            if (!datasets.some(d => ArCabildoabiertoEmbedVisualization.isDatasetDataSource(config.dataSource) && d.uri == config.dataSource.dataset)) {
                setConfig(produce(config, draft => {
                    if (ArCabildoabiertoEmbedVisualization.isDatasetDataSource(draft.dataSource)) {
                        draft.dataSource.dataset = undefined
                    }
                }))
            }
        }
    }, [datasets, config, setConfig])

    function optionLabels(o: string) {
        if (o == "Conjuntos de datos") {
            return <DatasetIcon size={20}/>
        } else if (o == "Filtros") {
            return <FunnelIcon size={20} weight={"light"}/>
        }
    }

    return <>
        <div className={"rounded-lg flex flex-col space-y-2 h-full"}>
            <div className={"flex border-b border-[var(--accent-dark)] w-full mt-2"}>
                <SelectionComponent
                    options={["Conjuntos de datos", "Filtros"]}
                    optionsNodes={feedOptionNodes(40, undefined, undefined, optionLabels)}
                    selected={selectedMenu}
                    onSelection={(v: string) => {
                        setSelectedMenu(v as "Conjuntos de datos" | "Filtros")
                    }}
                    className={"flex justify-center"}
                />
            </div>
            {selectedMenu == "Conjuntos de datos" && <ChooseDatasetPanelDatasetSelection
                config={config}
                setConfig={setConfig}
                onNewDataset={onNewDataset}
                setSelectedMenu={setSelectedMenu}
                datasets={datasets}
                creatingNewDataset={creatingNewDataset}
            />}
            {selectedMenu == "Filtros" && <ChooseDatasetPanelFiltersConfig
                config={config}
                setConfig={setConfig}
                setSelectedMenu={setSelectedMenu}
                datasets={datasets}
                onReloadData={onReloadData}
            />}
        </div>
    </>
}
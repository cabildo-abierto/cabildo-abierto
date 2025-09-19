import {PlotConfigProps} from "@/lib/types";
import {useEffect, useState} from "react";
import AddIcon from "@mui/icons-material/Add";
import {DatasetPreviewOnEditor} from "../../datasets/dataset-preview-on-editor";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {NewDatasetPanel} from "../../datasets/new-dataset-panel";
import {cleanText} from "@/utils/strings";
import {Button} from "../../../../modules/ui-utils/src/button";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import SearchBar from "@/components/buscar/search-bar";
import {produce} from "immer";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import TopicsIcon from "@/components/icons/topics-icon";
import {TopicsDataSourceConfig} from "@/components/visualizations/editor/topics-data-source-config";
import SelectionComponent from "@/components/buscar/search-selection-component";
import DatasetIcon from "@/components/icons/dataset-icon";
import {FunnelIcon} from "@phosphor-icons/react";
import {FilterConfig} from "@/components/visualizations/editor/filter-config";
import CachedIcon from "@mui/icons-material/Cached";
import StateButton, {StateButtonClickHandler} from "../../../../modules/ui-utils/src/state-button";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";


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
            fullWidth={true}
            color={"background-dark"}
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
                <div className={"mt-8"}><LoadingSpinner/></div>}
        </div>
    </>
}


const ChooseDatasetPanelDatasetSelection = ({
                                                config,
                                                setConfig,
                                                setNewDatasetPanelOpen,
                                                setSelectedMenu,
                                                datasets
                                            }: {
    config: PlotConfigProps
    setConfig: (c: PlotConfigProps) => void
    setNewDatasetPanelOpen: (v: boolean) => void
    setSelectedMenu: (v: "Conjuntos de datos" | "Filtros") => void
    datasets?: DatasetViewBasic[]
}) => {

    const creatingTopicsBased = ArCabildoabiertoEmbedVisualization.isTopicsDataSource(config.dataSource)
    return <>
        <div className={"flex space-x-1 px-2"}>
            <Button
                startIcon={<TopicsIcon/>}
                variant={"text"}
                color={creatingTopicsBased ? "background-dark2" : "background-dark"}
                size={"small"}
                sx={{
                    paddingX: "12px",
                    ":hover": {backgroundColor: "var(--background-dark3)"}
                }}
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
            </Button>
            <Button
                startIcon={<AddIcon/>}
                variant={"text"}
                color={"background-dark"}
                size={"small"}
                sx={{
                    paddingX: "12px"
                }}
                onClick={() => {
                    setNewDatasetPanelOpen(true)
                }}
            >
                Conjunto de datos
            </Button>
        </div>
        <div className={"px-2 pb-2"}>
            {!creatingTopicsBased && <DatasetsSearch datasets={datasets} setConfig={setConfig} config={config}/>}
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
                                                    onReloadData
                                                }: {
    config: PlotConfigProps
    setConfig?: (c: PlotConfigProps) => void
    setSelectedMenu?: (v: "Conjuntos de datos" | "Filtros") => void
    datasets?: DatasetViewBasic[]
    onReloadData?: StateButtonClickHandler
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
        return <div className={"text-sm text-[var(--text-light)] p-4 text-center"}>
            Elegí una fuente de datos primero.
        </div>
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
                <Button startIcon={<AddIcon/>} size={"small"} onClick={onAddFilter} color={"background-dark3"}>
                    Nuevo filtro
                </Button>}
        </div>

        {onReloadData && <div className={"flex justify-end w-full"}>
            <StateButton
                color={"background-dark3"}
                startIcon={<CachedIcon/>}
                text1="Cargar datos"
                size={"small"}
                handleClick={onReloadData}
            />
        </div>}
    </div>
}


export const ChooseDatasetPanel = ({datasets, config, setConfig, onReloadData}: {
    datasets?: DatasetViewBasic[],
    config: PlotConfigProps,
    setConfig: (config: PlotConfigProps) => void
    onReloadData?: StateButtonClickHandler
}) => {
    const [selectedMenu, setSelectedMenu] = useState<"Conjuntos de datos" | "Filtros">("Conjuntos de datos")
    const [newDatasetPanelOpen, setNewDatasetPanelOpen] = useState(false)

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

    function optionLabels(o: string){
        if (o == "Conjuntos de datos") {
            return <DatasetIcon size={20}/>
        } else if (o == "Filtros") {
            return <FunnelIcon size={20}/>
        }
    }


    return <>
        <div className={"rounded-lg flex flex-col space-y-2 h-full"}>
            <div className={"flex border-b border-[var(--text-lighter)] w-full mt-2"}>
                <SelectionComponent
                    options={["Conjuntos de datos", "Filtros"]}
                    optionsNodes={feedOptionNodes(40, undefined, undefined, "background-dark", optionLabels)}
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
                setNewDatasetPanelOpen={setNewDatasetPanelOpen}
                setSelectedMenu={setSelectedMenu}
                datasets={datasets}
            />}
            {selectedMenu == "Filtros" && <ChooseDatasetPanelFiltersConfig
                config={config}
                setConfig={setConfig}
                setSelectedMenu={setSelectedMenu}
                datasets={datasets}
                onReloadData={onReloadData}
            />}
        </div>
        <NewDatasetPanel open={newDatasetPanelOpen} onClose={() => {
            setNewDatasetPanelOpen(false)
        }}/>
    </>
}
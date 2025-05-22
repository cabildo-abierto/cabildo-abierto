import {PlotConfigProps} from "@/lib/types";
import {useEffect, useState} from "react";
import ResizableDiv from "../../../../modules/ui-utils/src/resizable-div";
import AddIcon from "@mui/icons-material/Add";
import {DatasetPreviewOnEditor} from "../../datasets/dataset-preview-on-editor";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {NewDatasetPanel} from "../../datasets/new-dataset-panel";
import {cleanText} from "@/utils/strings";
import {Button} from "../../../../modules/ui-utils/src/button";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import SearchBar from "@/components/buscar/search-bar";
import {produce} from "immer";
import {isDatasetDataSource} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";


export const ChooseDatasetPanel = ({datasets, config, setConfig}: {
    datasets?: DatasetViewBasic[],
    config: PlotConfigProps,
    setConfig: (config: PlotConfigProps) => void
}) => {
    const [searchValue, setSearchValue] = useState<string>("")
    const [filteredDatasets, setFilteredDatasets] = useState<DatasetViewBasic[]>(datasets)
    const [newDatasetPanelOpen, setNewDatasetPanelOpen] = useState(false)

    useEffect(() => {
        const v = cleanText(searchValue)
        const f = datasets ? datasets.filter((d) => {
            if(v.length == 0) return true
            return cleanText(d.name).includes(v)
        }) : undefined

        setFilteredDatasets(f)
    }, [searchValue, datasets])

    return <div className={"mt-16"}>
        <ResizableDiv initialWidth={320} minWidth={240} maxWidth={400} side={"right"}>
            <div className={"rounded-lg p-2 flex flex-col bg-[var(--background-dark)]"}>
                <div>
                    <div className={"flex justify-between pt-1 pb-4"}>
                        <div className={"font-bold text-2xl"}>
                            Datos
                        </div>
                        <div>
                            <Button
                                startIcon={<AddIcon/>}
                                variant={"text"}
                                color={"background-dark"}
                                size={"small"}
                                sx={{height: "32px", paddingX: "12px", borderRadius: "20px", ":hover": {backgroundColor: "var(--background-dark3)"}}}
                                onClick={() => {setNewDatasetPanelOpen(true)}}
                            >
                                Dataset
                            </Button>
                        </div>
                    </div>
                    <SearchBar
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        fullWidth={true}
                        color={"background-dark2"}
                    />
                </div>
                <div className={"space-y-1 mt-2 overflow-y-auto custom-scrollbar h-[calc(100vh-250px)]"}>
                    {filteredDatasets ? filteredDatasets.map((d, i) => {
                        return <div key={i} className={""}>
                            <DatasetPreviewOnEditor
                                dataset={d}
                                selected={config.dataSource && isDatasetDataSource(config.dataSource) && config.dataSource.dataset == d.uri}
                                onClick={() => {
                                    setConfig(produce(config, draft => {
                                        draft.dataSource = {
                                            $type: "ar.cabildoabierto.embed.visualization#datasetDataSource",
                                            dataset: d.uri
                                        }
                                    }))
                                }}
                            />
                        </div>
                    }) :
                    <div className={"mt-8"}><LoadingSpinner/></div>}
                </div>
            </div>
        </ResizableDiv>
        <NewDatasetPanel open={newDatasetPanelOpen} onClose={() => {setNewDatasetPanelOpen(false)}}/>
    </div>
}
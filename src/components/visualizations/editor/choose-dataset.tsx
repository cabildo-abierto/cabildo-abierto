import {PlotConfigProps} from "@/lib/types";
import {useEffect, useState} from "react";
import ResizableDiv from "../../../../modules/ui-utils/src/resizable-div";
import AddIcon from "@mui/icons-material/Add";
import {TextField} from "@mui/material";
import {DatasetPreviewSmall} from "../../datasets/dataset-preview";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {NewDatasetPanel} from "../../datasets/new-dataset-panel";
import {cleanText} from "@/utils/strings";
import {Button} from "../../../../modules/ui-utils/src/button";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";

export const ChooseDatasetPanel = ({datasets, config, updateConfig}: {
    datasets?: DatasetViewBasic[],
    config: PlotConfigProps,
    updateConfig: (k: string, v: any) => void
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
            <div className={"border rounded-lg p-2 flex flex-col"}>
                <div>
                    <div className={"flex justify-between"}>
                        <div className={"font-bold text-2xl"}>
                            Datos
                        </div>
                        <div>
                            <Button
                                startIcon={<AddIcon/>}
                                variant={"text"}
                                size={"small"}
                                sx={{height: "32px"}}
                                onClick={() => {setNewDatasetPanelOpen(true)}}
                            >
                                Dataset
                            </Button>
                        </div>
                    </div>
                    <hr className={"my-2"}/>
                    <TextField
                        value={searchValue}
                        size={"small"}
                        fullWidth={true}
                        placeholder={"buscar"}
                        onChange={(e) => {setSearchValue(e.target.value)}}
                    />
                </div>
                <div className={"space-y-1 mt-2 overflow-y-auto custom-scrollbar max-h-[calc(100vh-200px)]"}>
                    {filteredDatasets ? filteredDatasets.map((d, i) => {
                        return <div key={i} className={""}>
                            <DatasetPreviewSmall
                                dataset={d}
                                selected={config.datasetUri == d.uri}
                                onClick={() => {
                                    updateConfig("datasetUri", d.uri)
                                }}
                            />
                        </div>
                    }) : <div className={"mt-8"}><LoadingSpinner/></div>}
                </div>
            </div>
        </ResizableDiv>
        <NewDatasetPanel open={newDatasetPanelOpen} onClose={() => {setNewDatasetPanelOpen(false)}}/>
    </div>
}
import {ReactNode, useEffect, useState} from "react";
import {BaseFullscreenPopup} from "../../layout/utils/base-fullscreen-popup";
import StateButton from "../../layout/utils/state-button";
import {UploadFile} from "@mui/icons-material";
import {DatasetForTableView, DatasetTableView} from "./dataset-table-view";
import Papa from 'papaparse';
import {CloseButton} from "../../layout/utils/close-button";
import {post} from "@/utils/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { TextField } from "../../layout/utils/text-field";
import {UploadDatasetButton} from "@/components/visualizations/datasets/upload-dataset-button";


type CreateDatasetProps = {
    name: string
    description: string
    columns: string[]
    data: string
    format?: string
}


async function createDataset(dataset: CreateDatasetProps){
    return await post("/dataset", dataset)
}


const NewDatasetPanel = ({open, onClose}: {
    open: boolean, onClose: () => void
}) => {
    const qc = useQueryClient()
    const [data, setData] = useState<File | null>(null)
    const [columns, setColumns] = useState<string[] | null>()
    const [rows, setRows] = useState<any[] | null>()
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const createDatasetMutation = useMutation({
        mutationFn: createDataset,
        onSuccess: async ({data}) => {
            qc.invalidateQueries({
                predicate: query => query.queryKey.length > 0 && query.queryKey[0] == "datasets"
            })
        },
    })

    function onSubmit(f: File, filename: string){
        setData(f)
        setName(filename.split(".")[0])
    }

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => {
            const csvData = reader.result as string;

            Papa.parse(csvData, {
                header: true,
                complete: (result) => {
                    const columns = result.meta.fields
                    setColumns(columns)
                    setRows(result.data)
                },
                error: (error: any) => {
                    console.error('Error parsing CSV:', error);
                },
            })
        }

        if(data){
            reader.readAsText(data)
        }
    }, [data])

    async function onUpload(){
        const {error} = await createDatasetMutation.mutateAsync({
            name: name,
            columns,
            description,
            data: JSON.stringify(rows),
            format: "json"
        })
        if(error) return {error}

        onClose()
        return {}
    }

    function onClickClose(){
        setColumns(null)
        setRows(null)
        setData(null)
        setName("")
        onClose()
    }

    const dataset: DatasetForTableView | null = columns && rows && {
        columns: columns.map(c => ({name: c, $type: "ar.cabildoabierto.data.dataset#column"})),
        data: JSON.stringify(rows)
    }

    let center: ReactNode
    if(!columns){
        center = <div className={""}>
            <div className={"flex justify-end mt-2 mr-2"}>
                <CloseButton onClose={onClickClose} size={"small"}/>
            </div>
            <div className={"flex flex-col items-center space-y-8 py-4 px-16"}>
                <div>Nuevo conjunto de datos</div>
                <UploadDatasetButton onSubmit={onSubmit}/>
            </div>
        </div>
    } else {
        center = <div className={"max-h-[90vh] overflow-y-scroll custom-scrollbar"}>
            <div className={"flex justify-end mt-2 mr-2"}>
                <CloseButton onClose={onClickClose} size={"small"}/>
            </div>
            <div className={"flex flex-col items-center space-y-4 px-8"}>
                <h3>Nuevo conjunto de datos</h3>
                <div className={"w-80"}>
                    <TextField
                        size={"small"}
                        variant="outlined"
                        label={"Nombre"}
                        value={name}
                        fullWidth={true}
                        inputProps={{
                            autoComplete: 'off'
                        }}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="max-w-128 w-full">
                    <TextField
                        size={"small"}
                        variant="outlined"
                        label={"Descripción"}
                        value={description}
                        inputProps={{
                            autoComplete: 'off'
                        }}
                        multiline
                        fullWidth={true}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                {dataset && <div className={""}>
                    <DatasetTableView dataset={dataset} maxHeight={300} maxWidth={600}/>
                </div>}
                <div className={"flex justify-end space-x-2 mt-4 pb-8"}>
                    <StateButton
                        startIcon={<UploadFile/>}
                        handleClick={onUpload}
                        disabled={name.length == 0}
                        text1={"Publicar"}
                    />
                </div>
            </div>
        </div>
    }

    return <BaseFullscreenPopup
        open={open}
        closeButton={false}
        backgroundShadow={false}
    >
        {center}
    </BaseFullscreenPopup>
}


export default NewDatasetPanel
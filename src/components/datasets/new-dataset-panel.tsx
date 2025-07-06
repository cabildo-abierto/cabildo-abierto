import {Button, styled, TextField} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {useEffect, useState} from "react";
import {BaseFullscreenPopup} from "../../../modules/ui-utils/src/base-fullscreen-popup";
import {useRouter} from "next/navigation";
import JSZip from "jszip";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {UploadFile} from "@mui/icons-material";
import {DatasetForTableView, DatasetTableView} from "./dataset-table-view";
import Papa from 'papaparse';
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {post} from "@/utils/fetch";
import TopicsIcon from "@/components/icons/topics-icon";


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


export const UploadDatasetButton = ({onSubmit}: {onSubmit: (file: any, filename: string) => void}) => {
    const loadImage = async (e) => {
        if (e.target.files !== null) {
            const file = e.target.files[0]
            onSubmit(new Blob([file], { type: file.type }), file.name)
        }
    }
    return <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        sx={{textTransform: "none"}}
        disableElevation={true}
        startIcon={<CloudUploadIcon />}
    >
        Subir archivo (.csv)
        <VisuallyHiddenInput
            type="file"
            onChange={loadImage}
            multiple={false}
        />
    </Button>
}


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


export const NewDatasetPanel = ({open, onClose}: {
    open: boolean, onClose: () => void
}) => {
    const [data, setData] = useState<File | null>(null)
    const [columns, setColumns] = useState<string[] | null>()
    const [rows, setRows] = useState<any[] | null>()
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")

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
        const {error} = await createDataset({
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

    let center
    if(!columns){
        center = <div className={""}>
            <div className={"flex justify-end mt-2 mr-2"}>
                <CloseButton onClose={onClickClose} size={"small"}/>
            </div>
            <div className={"flex flex-col items-center space-y-8 py-4 px-16"}>
                <h3>Nuevo conjunto de datos</h3>
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
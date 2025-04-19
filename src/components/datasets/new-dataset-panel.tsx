import {Button, styled, TextField} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {useEffect, useState} from "react";
import {BaseFullscreenPopup} from "../../../modules/ui-utils/src/base-fullscreen-popup";
import {useRouter} from "next/navigation";
import JSZip from "jszip";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {UploadFile} from "@mui/icons-material";
import {DatasetView} from "./dataset-view";
import Papa from 'papaparse';
import {CloseButton} from "../../../modules/ui-utils/src/close-button";


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
        Subir archivo
        <VisuallyHiddenInput
            type="file"
            onChange={loadImage}
            multiple={false}
        />
    </Button>
}


export const NewDatasetPanel = ({open, onClose}: {
    open: boolean, onClose: () => void
}) => {
    const [data, setData] = useState(null)
    const [columns, setColumns] = useState<string[] | null>()
    const [rows, setRows] = useState<any[] | null>()
    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const router = useRouter()

    function onSubmit(f: File, filename: string){
        setData(f)
        setTitle(filename.split(".")[0])
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
        const zip = new JSZip();
        const fileData = await data.arrayBuffer(); // Read the file as an ArrayBuffer

        zip.file(data.name, fileData);

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const zipData = new File([zipBlob], data.name)

        const formData = new FormData()
        formData.set("data", zipData)
        const {error} = await createDataset(title, columns, description, formData, "zip")

        if(!error){
            router.push("/datos")
            onClose()
        }


        return {error}
    }

    function onClickClose(){
        setColumns(null)
        setRows(null)
        setData(null)
        setTitle("")
        onClose()
    }


    let center
    if(!columns){
        center = <div className={""}>
            <div className={"flex justify-end mt-2 mr-2"}>
                <CloseButton onClose={onClickClose} size={"small"}/>
            </div>
            <div className={"flex flex-col items-center space-y-8 py-4 px-16"}>
                <h2>Nuevo dataset</h2>
                <div className={"text-[var(--text-light)]"}>Subí un archivo en formato csv.</div>
                <UploadDatasetButton onSubmit={onSubmit}/>
            </div>
        </div>
    } else {
        center = <div className={"max-h-[90vh] overflow-y-scroll custom-scrollbar"}>
            <div className={"flex justify-end mt-2 mr-2"}>
                <CloseButton onClose={onClickClose} size={"small"}/>
            </div>
            <div className={"flex flex-col items-center space-y-4 px-8"}>
                <h2>Nuevo dataset</h2>
                <div className={"w-80"}>
                    <TextField
                        size={"small"}
                        variant="outlined"
                        label={"Título"}
                        value={title}
                        fullWidth={true}
                        inputProps={{
                            autoComplete: 'off'
                        }}
                        onChange={(e) => setTitle(e.target.value)}
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
                <div>
                    <DatasetView data={rows} maxHeight={"300px"}/>
                </div>
                <div className={"flex justify-end space-x-2 mt-4 pb-8"}>
                    <StateButton
                        startIcon={<UploadFile/>}
                        handleClick={onUpload}
                        disabled={columns == null || title.length == 0}
                        text1={"Publicar"}
                    />
                </div>
            </div>
        </div>
    }

    return <BaseFullscreenPopup
        open={open}
        closeButton={false}
    >
        {center}
    </BaseFullscreenPopup>
}
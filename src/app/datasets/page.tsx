"use client"
import {ThreeColumnsLayout} from "../../components/three-columns";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {styled, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import Papa from 'papaparse';
import {UploadFile} from "@mui/icons-material";
import {createDataset} from "../../actions/data";
import StateButton from "../../components/state-button";
import {BasicButton} from "../../components/ui-utils/basic-button";
import '../../components/datasets/index.css'
import {useUser} from "../../hooks/user";
import {useDatasets} from "../../hooks/contents";
import {DatasetPreview} from "../../components/datasets/dataset-preview";
import {DatasetView} from "../../components/datasets/dataset-view";
import JSZip from "jszip";

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


const UploadDatasetButton = ({onSubmit}: {onSubmit: (file: any, filename: string) => void}) => {
    const loadImage = async (e) => {
        if (e.target.files !== null) {
            const file = e.target.files[0];

            //const uniqueId = uuidv4()
            //const extension = file.type.split('/')[1];

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


const Page = () => {
    const [data, setData] = useState(null)
    const [columns, setColumns] = useState<string[] | null>()
    const [rows, setRows] = useState<any[] | null>()
    const [title, setTitle] = useState<string>("")
    const {user} = useUser()
    const {datasets} = useDatasets()

    function onSubmit(f: File, filename: string){
        setData(f)
        setTitle(filename.split(".")[0])
    }

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => {
            const csvData = reader.result as string;

            // Parse the CSV
            const result = Papa.parse(csvData, {
                header: true, // Treat the first row as headers
                complete: (result) => {
                    const columns = result.meta.fields
                    setColumns(columns)
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                },
            });
            setRows(result.data)
        };
        if(data){
            reader.readAsText(data)
        }
    }, [data])

    if(!columns){
        const center = <div className={"flex flex-col mt-8"}>
            <UploadDatasetButton onSubmit={onSubmit}/>
            <h2 className={"border-b mt-8 px-2"}>Datasets</h2>
            {datasets && datasets.map((d) => {
                return <div key={d.cid}>
                    <DatasetPreview dataset={d}/>
                </div>
            })}
        </div>

        return <ThreeColumnsLayout center={center}/>
    }

    async function onUpload(){
        const zip = new JSZip();
        const fileData = await data.arrayBuffer(); // Read the file as an ArrayBuffer

        zip.file(data.name, fileData);

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const zipData = new File([zipBlob], data.name)

        const formData = new FormData()
        formData.set("data", zipData)
        const {error} = await createDataset(title, columns, formData, "zip")
        return {error}
    }

    function onCancel(){
        setColumns(null)
        setRows(null)
        setData(null)
        setTitle("")
    }

    const center = <div className={"flex flex-col space-y-4 px-2"}>
        <div className={"flex justify-end space-x-2 mt-2"}>
            <BasicButton
                onClick={onCancel}
                variant={"text"}
            >
                Cancelar
            </BasicButton>
            <StateButton
                startIcon={<UploadFile/>}
                handleClick={onUpload}
                disabled={columns == null || title.length == 0}
                text1={"Publicar"}
            />
        </div>
        <div className={"w-64"}>
            <TextField
                size={"small"}
                variant="outlined"
                label={"Título"}
                value={title}
                inputProps={{
                    autoComplete: 'off'
                }}
                onChange={(e) => setTitle(e.target.value)}
            />
        </div>
        <div>
            <DatasetView data={rows}/>
        </div>
    </div>
    return <ThreeColumnsLayout center={center}/>
}


export default Page
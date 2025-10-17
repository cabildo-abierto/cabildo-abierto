import {$Typed} from "@atproto/api";
import {ColumnFilter} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {DatasetTableView} from "./dataset-table-view";
import {ArCabildoabiertoDataDataset} from "@/lex-api"
import {useMemo, useState} from "react";
import {TextField} from "@/components/layout/utils/text-field";
import {produce} from "immer";
import Papa from "papaparse";
import StateButton from "@/components/layout/utils/state-button";
import {UploadDatasetButton} from "@/components/visualizations/datasets/upload-dataset-button";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {post} from "@/utils/fetch";
import {DatasetSize} from "@/components/visualizations/datasets/dataset-size";


export type DatasetEditState = Omit<ArCabildoabiertoDataDataset.DatasetView, "$type" | "data" | "uri" | "cid" | "author" | "createdAt"> & {
    data?: string
    $type: "editing"
}

const initialDataset: DatasetEditState = {
    $type: "editing",
    name: "",
    columns: []
}

type CreateDatasetProps = {
    name: string
    description: string
    columns: string[]
    data: string
    format?: string
    uri?: string
}

async function createDataset(dataset: CreateDatasetProps){
    return await post<CreateDatasetProps, {uri: string}>("/dataset", dataset)
}

export const DatasetEditor = ({dataset, filters, onCreated}: {
    dataset?: ArCabildoabiertoDataDataset.DatasetView
    filters?: $Typed<ColumnFilter>[]
    onCreated?: (uri: string) => void
}) => {
    const [newDataset, setNewDataset] = useState<DatasetEditState>(dataset ? {...dataset, $type: "editing"} : initialDataset)
    const qc = useQueryClient()

    const rows = useMemo(() => {
        return newDataset.data ? JSON.parse(newDataset.data).length : undefined
    }, [newDataset])

    const createDatasetMutation = useMutation({
        mutationFn: createDataset,
        onSuccess: async ({data}) => {
            qc.invalidateQueries({
                predicate: query => query.queryKey.length > 0 && query.queryKey[0] == "datasets"
            })
            if(data) {
                qc.invalidateQueries({
                    predicate: query => query.queryKey.length > 0 && query.queryKey[0] == "dataset" && query.queryKey[1] == data.uri
                })
            }
        },
    })

    async function onPublish(){
        const {error, data} = await createDatasetMutation.mutateAsync({
            name: newDataset.name,
            columns: newDataset.columns.map(c => c.name),
            description: newDataset.description,
            data: newDataset.data,
            format: "json",
            uri: dataset?.uri
        })
        if(error) return {error}

        onCreated(data.uri)
        return {}
    }

    function onSubmit(f: File, filename: string){
        const reader = new FileReader();
        reader.onload = () => {
            const csvData = reader.result as string;

            Papa.parse(csvData, {
                header: true,
                complete: (result) => {
                    const columns: ArCabildoabiertoDataDataset.Column[] = result.meta.fields.map(c => ({
                        name: c
                    }))
                    const data = JSON.stringify(result.data)

                    setNewDataset(produce(newDataset, draft => {
                        draft.columns = columns
                        draft.data = data
                    }))
                },
                error: (error: any) => {
                    console.error('Error parsing CSV:', error);
                },
            })
        }
        reader.readAsText(f)
    }

    const validDataset = Boolean(newDataset.name) && Boolean(newDataset.description) && Boolean(newDataset.data)

    return <div className={"px-2 space-y-4 flex flex-col h-full pb-4"}>
        <div className={"flex justify-between items-center"}>
            <h2 className={"text-lg"}>
                {dataset ? "Editar conjunto de datos" : "Nuevo conjunto de datos"}
            </h2>
            <StateButton
                size="medium"
                variant="outlined"
                text1={dataset ? "Guardar cambios" : "Publicar"}
                handleClick={onPublish}
                disabled={!validDataset}
            />
        </div>
        <div className={"flex flex-col space-y-4"}>
            <TextField
                size={"small"}
                value={newDataset.name}
                fullWidth={true}
                label={"Nombre"}
                onChange={e => {
                    setNewDataset(produce(newDataset, draft => {
                        draft.name = e.target.value
                    }))
                }}
            />
            <TextField
                size={"small"}
                paddingX={"12px"}
                value={newDataset.description}
                fullWidth={true}
                label={"Descripción"}
                minRows={3}
                multiline={true}
                onChange={e => {
                    setNewDataset(produce(newDataset, draft => {
                        draft.description = e.target.value
                    }))
                }}
            />
            <div className={"flex justify-between items-center"}>
                <DatasetSize dataset={newDataset} showLoading={false}/>
                <UploadDatasetButton
                    onSubmit={onSubmit}
                    text={rows ? "Reemplazar datos (.csv)" : "Subir archivo (.csv)"}
                />
            </div>
        </div>
        {newDataset.data && <DatasetTableView
            dataset={{
                columns: newDataset.columns,
                data: newDataset.data
            }}
            filters={filters}
        />}
    </div>
}
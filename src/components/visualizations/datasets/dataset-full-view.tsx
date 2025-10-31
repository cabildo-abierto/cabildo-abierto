import {DatasetTableView} from "./dataset-table-view";
import {DatasetDescription} from "./dataset-description";
import {DateSince} from "../../layout/utils/date";
import {ArCabildoabiertoDataDataset} from "@/lex-api"
import {Authorship} from "@/components/feed/frame/authorship";
import {$Typed} from "@/lex-api/util";
import LoadingSpinner from "../../layout/base/loading-spinner";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api"
import {DatasetOptionsButton} from "@/components/layout/options/dataset-options-button";


export type AnyDatasetView = $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> | $Typed<ArCabildoabiertoDataDataset.TopicsDatasetView>


export const DatasetFullView = ({dataset, maxWidth, filters, onClickEdit}: {
    dataset: AnyDatasetView
    filters?: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[]
    maxWidth?: number
    onClickEdit?: () => void
}) => {
    const name = ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) ? "Datos" : dataset.name

    return <div className={"px-2 space-y-1 flex flex-col h-full pb-4"}>
        <div className={"flex flex-col space-y-1"}>
            <div className={"flex justify-between items-start space-x-2"}>
                <h2>{name}</h2>
                <DatasetOptionsButton dataset={dataset} onClickEdit={onClickEdit}/>
            </div>
            {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) &&
                <div className={"text-sm text-[var(--text-light)] space-x-1 flex items-center"}>
                    <div>
                        <Authorship author={dataset.author} text={"Publicado por"}/>
                    </div>
                    <div>hace <DateSince date={dataset.createdAt}/> {dataset.editedAt && <span>(editado hace <DateSince date={dataset.editedAt}/>)</span>}</div>
                </div>}
            <div className={"mt-3 text-[var(--text-light)]"}>
                {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <>
                    <div className={"font-semibold text-[var(--text)]"}>
                        Descripción
                    </div>
                    <DatasetDescription
                        description={dataset.description}
                    />
                </>}
                {/*<div className={"font-semibold text-[var(--text)] mt-4"}>
                    Tamaño
                </div>
                <DatasetSize dataset={dataset}/>*/}
                <div className={"font-semibold text-[var(--text)] mt-4"}>
                    Datos
                </div>
            </div>
        </div>
        {(ArCabildoabiertoDataDataset.isDatasetView(dataset) || ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset)) ? <DatasetTableView
                dataset={dataset}
                maxWidth={maxWidth}
                filters={filters}
            /> :
            <div className={"py-8"}>
                <LoadingSpinner/>
            </div>}
    </div>
}
import {DatasetTableView} from "./dataset-table-view";
import {DatasetDescription} from "./dataset-description";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {ArCabildoabiertoDataDataset} from "@/lex-api/index"
import {Authorship} from "@/components/feed/frame/authorship";
import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button";
import {$Typed} from "@/lex-api/util";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"


export const DatasetFullView = ({dataset, maxWidth, filters}: {
    dataset: $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> | $Typed<ArCabildoabiertoDataDataset.TopicsDatasetView>
    filters?: $Typed<ArCabildoabiertoEmbedVisualization.ColumnFilter>[]
    maxWidth?: number
}) => {

    const rows = ArCabildoabiertoDataDataset.isDatasetView(dataset) || ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) ? JSON.parse(dataset.data).length : undefined

    const name = ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) ? "Datos" : dataset.name

    return <div className={"px-2 space-y-1 flex flex-col h-full pb-4"}>
        <div className={"flex flex-col space-y-1"}>
            <div className={"flex justify-between items-start space-x-2"}>
                <h2>{name}</h2>
                {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <ContentOptionsButton record={dataset}/>}
            </div>
            {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) &&
                <div className={"text-sm text-[var(--text-light)] space-x-1 flex items-center"}>
                    <div>
                        <Authorship author={dataset.author} text={"Publicado por"}/>
                    </div>
                    <div>hace <DateSince date={dataset.createdAt}/></div>
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
                <div className={"font-semibold text-[var(--text)] mt-4"}>
                    Tamaño
                </div>
                <div className={"text-[var(--text-light)] space-x-1 flex items-center"}>
                    <div className={"font-semibold"}>{rows == undefined ? "..." : rows}</div>
                    <div>filas x</div>
                    <div className={"font-semibold"}>{dataset.columns.length}</div>
                    <div>columnas</div>
                </div>
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
            </div>
        }
    </div>
}
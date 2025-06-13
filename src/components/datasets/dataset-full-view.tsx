import {DatasetTableView} from "./dataset-table-view";
import {DatasetDescription} from "./dataset-description";
import {useLayoutConfig} from "../layout/layout-config-context";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {DatasetView, DatasetViewBasic, isDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {pxToNumber} from "@/utils/strings";
import {Authorship} from "@/components/feed/frame/authorship";
import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button";
import {$Typed} from "@atproto/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";


export const DatasetFullView = ({dataset, maxWidth}: {
    dataset: $Typed<DatasetView> | $Typed<DatasetViewBasic>
    maxWidth?: number
}) => {

    const rows = isDatasetView(dataset) ? JSON.parse(dataset.data).length : undefined

    return <div className={"px-2 space-y-1 flex flex-col h-full pb-4"}>
        <div className={"flex flex-col space-y-1"}>
            <div className={"flex justify-between items-start space-x-2"}>
                <h2>{dataset.name}</h2>
                <ContentOptionsButton record={dataset}/>
            </div>
            <div className={"text-sm text-[var(--text-light)] space-x-1 flex items-center"}>
                <div><Authorship content={dataset} text={"Publicado por"}/></div>
                <div>hace <DateSince date={dataset.createdAt}/></div>
            </div>
            <div className={"mt-3 text-[var(--text-light)]"}>
                <div className={"font-semibold text-[var(--text)]"}>
                    Descripción
                </div>
                <DatasetDescription
                    description={dataset.description}
                />
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
        {isDatasetView(dataset) ? <DatasetTableView
                dataset={dataset}
                maxWidth={maxWidth}
            /> :
            <div className={"py-8"}>
                <LoadingSpinner/>
            </div>
        }
    </div>
}